"use client";

import React, { FC } from 'react';
import { Tooltip } from '@/components/index';

// --- TYPE DEFINITIONS ---
export interface AnalysisData {
    article_title: string;
    full_post_text: string;
    analysis_summary: string;
    errors_found: {
        type: string;
        problematic_translation: string;
        original_sentence: string;
        suggested_correction: string;
        explanation: string;
    }[];
}

export interface Analysis {
    id: string;
    url: string;
    date: string;
    data: AnalysisData;
}

interface DetailPageProps {
  analysis: Analysis | undefined;
  onBack: () => void;
}

// --- HELPER FUNCTION ---
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- COMPONENT ---
export const DetailPage: FC<DetailPageProps> = ({ analysis, onBack }) => {

    const renderAnnotatedPost = () => {
        if (!analysis?.data?.full_post_text) {
            return <p>{analysis?.data?.full_post_text || ''}</p>;
        }

        const { full_post_text, errors_found } = analysis.data;
        if (!errors_found || errors_found.length === 0) {
            return <div className="whitespace-pre-wrap">{full_post_text}</div>;
        }

        // --- Color and Error Mapping ---
        const highlightColors = [
            'bg-red-500/20 border-red-500',
            'bg-blue-500/20 border-blue-500',
            'bg-green-500/20 border-green-500',
            'bg-yellow-500/20 border-yellow-500',
            'bg-purple-500/20 border-purple-500',
            'bg-pink-500/20 border-pink-500',
            'bg-teal-500/20 border-teal-500',
        ];
        const errorToColorMap = new Map<typeof errors_found[0], string>();
        errors_found.forEach((error, index) => {
            errorToColorMap.set(error, highlightColors[index % highlightColors.length]);
        });

        // 1. Split the text into paragraphs by looking for one or more empty lines.
        const paragraphs = full_post_text.split(/\n\s*\n/g);

        // 2. Process each paragraph.
        return paragraphs.map((paragraph, pIndex) => {
            if (paragraph.trim() === '') {
                return null; // Don't render empty paragraphs
            }

            const matches: { start: number; end: number; error: typeof errors_found[0] }[] = [];
            errors_found.forEach(error => {
                const searchTerm = error.problematic_translation;
                if (!searchTerm || !paragraph.includes(searchTerm)) return;
                
                const regex = new RegExp(escapeRegExp(searchTerm), 'g');
                let match;
                while ((match = regex.exec(paragraph)) !== null) {
                    matches.push({ start: match.index, end: regex.lastIndex, error });
                }
            });

            if (matches.length === 0) {
                return <p key={pIndex} className="mb-6">{paragraph}</p>;
            }

            matches.sort((a, b) => a.start - b.start);

            const content: (string | React.JSX.Element)[] = [];
            let lastIndex = 0;

            matches.forEach((match, index) => {
                if (match.start > lastIndex) {
                    content.push(paragraph.substring(lastIndex, match.start));
                }

                const tooltipJsx = (
                    <div className="space-y-2 text-left">
                        <div className="font-bold text-base text-white border-b border-gray-600 pb-1 mb-2">[{match.error.type}]</div>
                        <div><strong className="text-gray-400 block text-xs">原文對照:</strong><span className="italic text-gray-300">&ldquo;{match.error.original_sentence}&rdquo;</span></div>
                        <div><strong className="text-gray-400 block text-xs">建議譯文:</strong><span className="text-green-300">{match.error.suggested_correction}</span></div>
                        <div className="mt-1"><strong className="text-gray-400 block text-xs">AI 解釋:</strong><span className="text-gray-300">{match.error.explanation}</span></div>
                    </div>
                );

                const colorClass = errorToColorMap.get(match.error) || 'bg-gray-500/20 border-gray-500';

                content.push(
                    <Tooltip key={index} text={tooltipJsx}>
                        <span className={`inline-block rounded-sm px-1 py-0.5 border-b-2 ${colorClass}`}>
                            {paragraph.substring(match.start, match.end)}
                        </span>
                    </Tooltip>
                );
                lastIndex = match.end;
            });

            if (lastIndex < paragraph.length) {
                content.push(paragraph.substring(lastIndex));
            }

            return <p key={pIndex} className="mb-6">{content}</p>;
        });
    };

    if (!analysis) {
        return <div className="text-center text-white">找不到分析紀錄。</div>;
    }

    return (
        <div>
            <header className="mb-6 flex items-center">
                <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    返回列表
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center flex-grow">{analysis.data.article_title}</h1>
            </header>

            <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-6 p-4 bg-gray-900 rounded-md text-gray-300 italic">
                    {analysis.data.analysis_summary}
                </div>
                <h2 className="text-xl font-bold text-white mb-4">校對文章 (滑鼠懸停查看錯誤分析)</h2>
                <div className="bg-gray-900 p-4 md:p-6 rounded-md text-gray-200 text-lg leading-relaxed">
                    {renderAnnotatedPost()}
                </div>
            </div>
        </div>
    );
};