"use client";

import { useEffect, useState } from 'react';
import { DetailPage, Analysis } from '@/components/DetailPage';
import { useRouter } from 'next/navigation';
import React from 'react';

interface AnalysisDetailProps {
  id: string;
}

const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ id }) => {
    const [analysis, setAnalysis] = useState<Analysis | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (id) {
            try {
                const storedAnalyses = localStorage.getItem('pttAnalyses');
                if (storedAnalyses) {
                    const analyses: Analysis[] = JSON.parse(storedAnalyses);
                    const foundAnalysis = analyses.find(a => a.id === id);
                    if (foundAnalysis) {
                        setAnalysis(foundAnalysis);
                    } else {
                        setError('Analysis not found.');
                    }
                } else {
                    setError('No analyses found in storage.');
                }
            } catch (e) {
                setError('Failed to load analysis from storage.');
                console.error(e);
            }
        }
    }, [id]);

    const handleBack = () => {
        router.push('/');
    };

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!analysis) {
        return <div className="text-center text-white">Loading analysis...</div>;
    }

    return <DetailPage analysis={analysis} onBack={handleBack} />;
};

export default AnalysisDetail;