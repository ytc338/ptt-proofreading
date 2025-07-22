import re
import json
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from bs4 import BeautifulSoup
from ..services import get_ai_service

# --- Pydantic Model for Request Body ---
class AnalyzeRequest(BaseModel):
    url: str

# --- APIRouter Setup ---
router = APIRouter(
    prefix="/api/analyze",
    tags=["analyze"],
)

# --- Helper Functions ---
def fetch_ptt_content(url: str) -> str:
    try:
        response = requests.get(url, cookies={'over18': '1'}, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'lxml')
        main_content = soup.find(id='main-content')
        if not main_content:
            raise ValueError("Main content not found in PTT article.")

        # Remove metadata and push messages from the HTML structure
        for tag in main_content.find_all(['div', 'span'], class_=[ 'article-metaline', 'article-metaline-right', 'push' ]):
            tag.decompose()

        # Get the raw text, preserving line breaks for paragraph detection
        full_text = main_content.get_text()

        # Split at the common PTT separator for signature/comments
        content_part = full_text.split('--')[0]

        # Remove the header lines (Author, Title, Time) using regex
        cleaned_content = re.sub(r'^(作者|標題|時間).*\n', '', content_part, flags=re.MULTILINE)
        
        return cleaned_content.strip()

    except requests.RequestException as e:
        print(f"Scraping failed for {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Could not scrape the PTT article content: {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_and_fetch_source(post_text: str) -> str | None:
    url_regex = r"(https?:\/\/[^\s]+)"
    match = re.search(url_regex, post_text)
    
    if not match:
        print("No source URL found in the post.")
        return None
        
    source_url = match.group(0)
    print(f"Source URL found, attempting to scrape: {source_url}")
    
    try:
        response = requests.get(source_url, timeout=10)
        if response.status_code != 200:
            print(f"Could not fetch source URL {source_url}. Status: {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.text, 'lxml')
        
        content_selectors = ['article', 'main', '.post-content', '.entry-content']
        content = ''
        for selector in content_selectors:
            if soup.select_one(selector):
                content = soup.select_one(selector).get_text()
                break
        else:
            content = soup.body.get_text() if soup.body else ''
            
        cleaned_content = ' '.join(content.split()).strip()
        print("Successfully scraped and cleaned content from source URL.")
        return cleaned_content
        
    except requests.RequestException as e:
        print(f"Failed to scrape source URL {source_url}: {e}")
        return None

def extract_ptt_article_id(url: str) -> str | None:
    """Extracts the unique article ID from a PTT URL."""
    # Example URL: https://www.ptt.cc/bbs/Gossiping/M.1673424234.A.123.html
    match = re.search(r"/bbs/.*/(M\.\d+\.A\.[A-Z0-9_]+)\.html", url)
    if match:
        return match.group(1)
    return None

def extract_title_from_text(text: str) -> str:
    """Extracts the article title from the raw post text as a fallback."""
    title_match = re.search(r"標題\s+(.*)", text)
    if title_match:
        return title_match.group(1).strip()
    return "Untitled Analysis" # Final fallback

# --- Main API Endpoint ---
@router.post("")
async def analyze_url(request: AnalyzeRequest):
    if not request.url or 'ptt.cc/bbs/' not in request.url:
        raise HTTPException(status_code=400, detail="A valid PTT URL is required.")

    article_id = extract_ptt_article_id(request.url)
    if not article_id:
        raise HTTPException(status_code=400, detail="Could not extract a valid article ID from the PTT URL.")

    try:
        ptt_post_text = fetch_ptt_content(request.url)
        source_text = extract_and_fetch_source(ptt_post_text)
        ground_truth_original = source_text or ptt_post_text
        
        ai_service = get_ai_service()
        analysis_result_json_string = ai_service.perform_analysis(ptt_post_text, ground_truth_original)
        
        analysis_data = json.loads(analysis_result_json_string)

        # --- Fallback logic for title ---
        if not analysis_data.get("article_title"):
            analysis_data["article_title"] = extract_title_from_text(ptt_post_text)
        
        return {"article_id": article_id, "analysis": analysis_data}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"API Route Error: {e}")
        raise HTTPException(status_code=500, detail=f"An unknown server error occurred: {e}")