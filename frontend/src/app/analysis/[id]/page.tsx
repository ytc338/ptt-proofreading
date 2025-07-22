"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisDetail, Analysis, NotFound } from '@/components/index';

const AnalysisPage = () => {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (typeof id === 'string') {
            try {
                const storedAnalyses = localStorage.getItem('pttAnalyses');
                if (storedAnalyses) {
                    const analyses: Analysis[] = JSON.parse(storedAnalyses);
                    const foundAnalysis = analyses.find(a => a.id === id);
                    if (foundAnalysis) {
                        setAnalysis(foundAnalysis);
                    } else {
                        setError('找不到指定的分析結果。');
                    }
                } else {
                    setError('找不到任何分析紀錄。');
                }
            } catch (e) {
                setError('讀取分析紀錄時發生錯誤。');
                console.error("Failed to parse analyses from localStorage", e);
            } finally {
                setIsLoading(false);
            }
        }
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><p>讀取中...</p></div>;
    }

    if (error) {
        return <NotFound message={error} />;
    }

    if (!analysis) {
        return <NotFound message="沒有可顯示的分析結果。" />;
    }

    return <AnalysisDetail analysis={analysis} />;
};

export default AnalysisPage;
