"use client";

import React, { useState, useEffect } from 'react';
import { HomePage, Analysis, AnalysisData } from '@/components/index';

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
                throw new Error(errorData.detail || 'API request failed');
            }

            const result: { article_id: string; analysis: AnalysisData } = await response.json();
            
            const newAnalysis: Analysis = {
                id: result.article_id,
                url: url,
                date: new Date().toISOString(),
                data: result.analysis
            };

            // Replace existing analysis if ID matches, otherwise add as new
            const updatedAnalyses = analyses.filter(a => a.id !== newAnalysis.id);
            saveAnalyses([newAnalysis, ...updatedAnalyses]);

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