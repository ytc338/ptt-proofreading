"use client"; // This directive is essential for components using hooks

import React, { useState, useEffect, FC, ReactNode } from 'react';
import { Tooltip } from '@/components/index'; // Or the correct path to your component

interface DetailPageProps {
  analysis: Analysis | undefined;
  onBack: () => void;
}

export const DetailPage: FC<DetailPageProps> = ({ analysis, onBack }) => {
    const renderAnnotatedPost = () => {
        if (!analysis?.data?.full_post_text) return null;

        let content: (string | JSX.Element)[] = [analysis.data.full_post_text];
        const errorTypeMap: { [key: string]: string } = {
            'Semantic Error': 'bg-red-500/20 border-b-2 border-red-500',
            'Omission': 'bg-orange-500/20 border-b-2 border-orange-500',
            'Addition': 'bg-blue-500/20 border-b-2 border-blue-500',
            'Tone Mismatch': 'bg-purple-500/20 border-b-2 border-purple-500',
            'Mistranslated Term': 'bg-yellow-500/20 border-b-2 border-yellow-500'
        };

        analysis.data.errors_found?.forEach((error, index) => {
            let newContent: (string | JSX.Element)[] = [];
            content.forEach(segment => {
                if (typeof segment === 'string' && segment.includes(error.problematic_translation)) {
                    const parts = segment.split(error.problematic_translation);
                    parts.forEach((part, i) => {
                        newContent.push(part);
                        if (i < parts.length - 1) {
                            // The new "Super Tooltip"
                            const tooltipJsx = (
                                <div className="space-y-2">
                                    <div className="font-bold text-base text-white border-b border-gray-600 pb-1">[{error.type}]</div>
                                    <div><strong className="text-gray-400 block text-xs">原文對照:</strong><span className="italic">"{error.original_sentence}"</span></div>
                                    <div><strong className="text-gray-400 block text-xs">建議譯文:</strong>{error.suggested_correction}</div>
                                    <div><strong className="text-gray-400 block text-xs">AI 解釋:</strong>{error.explanation}</div>
                                </div>
                            );
                            newContent.push(
                                <Tooltip key={`${index}-${i}`} text={tooltipJsx}>
                                    <span className={`rounded-sm px-1 py-0.5 ${errorTypeMap[error.type] || ''}`}>
                                        {error.problematic_translation}
                                    </span>
                                </Tooltip>
                            );
                        }
                    });
                } else {
                    newContent.push(segment);
                }
            });
            content = newContent;
        });

        return <div className="whitespace-pre-wrap leading-relaxed">{content}</div>;
    };

    if (!analysis) return <div className="text-center text-white">找不到分析紀錄。</div>;

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
                <div className="mb-6 p-4 bg-gray-900 rounded-md text-gray-300 italic">{analysis.data.analysis_summary}</div>
                <div className="bg-gray-900 p-4 md:p-6 rounded-md text-gray-200">
                    {renderAnnotatedPost()}
                </div>
            </div>
        </div>
    );
};
