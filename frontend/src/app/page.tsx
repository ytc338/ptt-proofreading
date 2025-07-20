"use client";

import React, { useState, useEffect } from 'react';
import { HomePage, Analysis, AnalysisData } from '@/components/index';

const generateSlug = (title: string, maxLength: number = 50): string => {
  const cleanedTitle = title
    .toLowerCase()
    // Remove common PTT title prefixes like [問卦] or [新聞]
    .replace(/\\[(.*?)\\]/g, '')
    // Remove any characters that aren't letters, numbers, or whitespace
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim();

  const words = cleanedTitle.split(/\s+/);
  let slug = '';

  // Build the slug word by word until it reaches the max length
  for (const word of words) {
    if ((slug + '-' + word).length > maxLength) {
      break;
    }
    slug += (slug ? '-' : '') + word;
  }
  
  // Fallback for empty titles
  return slug || 'untitled';
};

export default function Home() {
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedAnalyses = localStorage.getItem('pttAnalyses');
            if (storedAnalyses) {
                setAnalyses(JSON.parse(storedAnalyses));
            }
        } catch (e) {
            console.error("Failed to parse analyses from localStorage", e);
            setAnalyses([]);
        }
    }, []);

    const saveAnalyses = (newAnalyses: Analysis[]) => {
        setAnalyses(newAnalyses);
        localStorage.setItem('pttAnalyses', JSON.stringify(newAnalyses));
    };

    const handleAnalyze = async (url: string) => {
        setError(null);
        setIsLoading(true);
        setLoadingMessage('正在分析文章...');

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000/api/analyze';
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const analysisResult: AnalysisData = await response.json();
            
            const uniqueId = Date.now().toString();
            const shortSlug = generateSlug(analysisResult.article_title);

            const newAnalysis: Analysis = {
                id: `${shortSlug}-${uniqueId}`,
                url: url,
                date: new Date().toISOString(),
                data: analysisResult
            };
            const updatedAnalyses = [newAnalysis, ...analyses];
            saveAnalyses(updatedAnalyses);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 md:p-8">
            <div className="w-full mx-auto transition-all duration-300 max-w-6xl">
                <HomePage
                    onAnalyze={handleAnalyze}
                    analyses={analyses}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    error={error}
                />
            </div>
        </main>
    );
};