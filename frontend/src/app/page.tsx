"use client"; // This directive is essential for components using hooks

import React, { useState, useEffect } from 'react';
import { DetailPage, HomePage, Analysis, AnalysisData } from '@/components/index'; // Or the correct path to your component


export default function Home() {
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [currentView, setCurrentView] = useState('home');
    const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
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
            
            const newAnalysis: Analysis = {
                id: Date.now(),
                url: url,
                date: new Date().toISOString(),
                data: analysisResult
            };
            const updatedAnalyses = [newAnalysis, ...analyses];
            saveAnalyses(updatedAnalyses);
            handleSelectAnalysis(newAnalysis.id);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAnalysis = (id: number) => {
        setSelectedAnalysisId(id);
        setCurrentView('detail');
    };

    const handleBackToHome = () => {
        setSelectedAnalysisId(null);
        setCurrentView('home');
    };

    const selectedAnalysis = analyses.find(a => a.id === selectedAnalysisId);

    return (
        <main className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 md:p-8">
            <div className={`w-full mx-auto transition-all duration-300 ${currentView === 'home' ? 'max-w-6xl' : 'max-w-screen-xl'}`}>
                {currentView === 'home' ? (
                    <HomePage
                        onAnalyze={handleAnalyze}
                        onSelectAnalysis={handleSelectAnalysis}
                        analyses={analyses}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        error={error}
                    />
                ) : (
                    <DetailPage analysis={selectedAnalysis} onBack={handleBackToHome} />
                )}
            </div>
        </main>
    );
};
