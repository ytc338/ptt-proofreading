"use client";

import { DetailPage, Analysis } from '@/components/DetailPage';
import { useRouter } from 'next/navigation';
import React from 'react';

interface AnalysisDetailProps {
  analysis: Analysis;
}

export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ analysis }) => {
    const router = useRouter();

    const handleBack = () => {
        router.push('/');
    };

    return <DetailPage analysis={analysis} onBack={handleBack} />;
};
