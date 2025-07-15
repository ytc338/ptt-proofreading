import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// This is the main handler for POST requests to /api/analyze
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !url.includes('ptt.cc/bbs/')) {
      return NextResponse.json({ error: 'A valid PTT URL is required.' }, { status: 400 });
    }

    // Step 1: Fetch the PTT post content
    const pttPostText = await fetchPttContent(url);
    if (!pttPostText) {
        return NextResponse.json({ error: 'Failed to fetch or parse PTT content.' }, { status: 500 });
    }
    
    // Step 2: Try to find and fetch content from a source link within the post
    const sourceText = await extractAndFetchSource(pttPostText);

    // Step 3: Determine the ground truth. If we found source text, use it. Otherwise, fall back to the PTT post itself for analysis.
    const groundTruthOriginal = sourceText || pttPostText;

    // Step 4: Send to AI for analysis
    const analysisResult = await analyzeTranslationWithAi(pttPostText, groundTruthOriginal);

    // Step 5: Return the successful analysis result to the frontend
    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('API Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Fetches and parses the main content from a PTT article URL using cheerio.
 * @param url The PTT article URL
 * @returns The clean text content of the article
 */
async function fetchPttContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, { headers: { 'Cookie': 'over18=1' } });
        if (!response.ok) throw new Error(`Failed to fetch PTT page. Status: ${response.status}`);
        const html = await response.text();
        const $ = cheerio.load(html);
        const mainContent = $('#main-content');
        mainContent.find('.article-metaline, .article-metaline-right, .push').remove();
        return mainContent.text().trim();
    } catch (error) {
        console.error('Scraping failed:', error);
        throw new Error('Could not scrape the PTT article content.');
    }
}

/**
 * New helper function to find and scrape a source URL from post text.
 * @param postText The text content of the PTT post.
 * @returns The text content from the scraped source URL, or null if not found or failed.
 */
async function extractAndFetchSource(postText: string): Promise<string | null> {
    // A simple regex to find the first http or https URL in the text
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = postText.match(urlRegex);

    if (match && match[0]) {
        const sourceUrl = match[0];
        console.log(`Source URL found, attempting to scrape: ${sourceUrl}`);
        try {
            const response = await fetch(sourceUrl);
            if (!response.ok) {
                console.warn(`Could not fetch source URL ${sourceUrl}. Status: ${response.status}`);
                return null;
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // A series of heuristics to find the main content of an article.
            // This can be expanded for better accuracy on different website structures.
            let content = '';
            if ($('article').length) content = $('article').text();
            else if ($('main').length) content = $('main').text();
            else if ($('.post-content').length) content = $('.post-content').text();
            else if ($('.entry-content').length) content = $('.entry-content').text();
            else content = $('body').text(); // Fallback to body text
            
            // Basic cleanup to remove excessive whitespace.
            const cleanedContent = content.replace(/\s\s+/g, ' ').trim();
            console.log(`Successfully scraped and cleaned content from source URL.`);
            return cleanedContent;

        } catch (error) {
            console.error(`Failed to scrape source URL ${sourceUrl}:`, error);
            return null; // Don't block the main analysis if source scraping fails
        }
    }
    console.log('No source URL found in the post.');
    return null; // No URL found
}

/**
 * Calls the Gemini API with an improved prompt for higher quality analysis.
 * @param forumPostText The scraped text from the PTT article.
 * @param originalSourceText The ground-truth text, either from a source link or the PTT post itself.
 * @returns The JSON analysis from the Gemini API.
 */
async function analyzeTranslationWithAi(forumPostText: string, originalSourceText: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables.");
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
        You are a strict, meticulous, and professional localization editor. Your task is to analyze a forum post that contains a user-provided translation (in Traditional Chinese). The original source text is also provided for comparison. Your standards are very high.

        Follow these steps with extreme precision:
        1.  First, return the entire, unmodified text of the original forum post in the 'full_post_text' field.
        2.  Extract the article title from the "標題:" line of the forum post.
        3.  Using the provided 'Original Source Text' as the ground truth, compare it against the translation found in the 'Forum Post Text'. Identify not just obvious mistakes, but also subtle errors in tone, nuance, style, and cultural context. Be critical.
        4.  For each error you find in the translation, you MUST provide the corresponding sentence from the 'Original Source Text' in the 'original_sentence' field. This is non-negotiable.
        5.  Generate a concise, professional one-sentence summary of the translation quality.
        6.  Return your complete analysis ONLY in the specified JSON format. Do not add any commentary before or after the JSON object.

        ---
        Forum Post Text:
        ${forumPostText}
        ---
        Original Source Text:
        ${originalSourceText}
        ---
    `;

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    article_title: { type: "STRING" },
                    full_post_text: { type: "STRING" },
                    analysis_summary: { type: "STRING" },
                    errors_found: {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                type: { type: "STRING", enum: ['Semantic Error', 'Omission', 'Addition', 'Tone Mismatch', 'Mistranslated Term'] },
                                problematic_translation: { type: "STRING" },
                                original_sentence: { type: "STRING" },
                                suggested_correction: { type: "STRING" },
                                explanation: { type: "STRING" }
                            },
                            required: ["type", "problematic_translation", "original_sentence", "suggested_correction", "explanation"]
                        }
                    }
                },
                required: ["article_title", "full_post_text", "analysis_summary", "errors_found"]
            }
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`Gemini API request failed with status ${response.status}.`);
    }

    const result = await response.json();
    if (result.candidates && result.candidates[0]?.content?.parts[0]) {
        return JSON.parse(result.candidates[0].content.parts[0].text);
    } else {
        console.warn("Unexpected Gemini API response structure:", result);
        throw new Error("Received an unexpected response format from the Gemini API.");
    }
}
