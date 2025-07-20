"use client";

import React, { useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner, ErrorMessage, Analysis } from '@/components/index';

interface HomePageProps {
  onAnalyze: (url: string) => void;
  analyses: Analysis[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

export const HomePage: FC<HomePageProps> = ({ onAnalyze, analyses, isLoading, loadingMessage, error }) => {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('ptt.cc/bbs/')) {
      alert('請輸入一個有效的 PTT 文章網址。');
      return;
    }
    onAnalyze(url);
    setUrl('');
  };

  const handleSelectAnalysis = (id: string) => {
    router.push(`/analysis/${id}`);
  };

  return (
    <div>
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white">PTT 譯文校對工作台</h1>
        <p className="text-lg text-gray-400 mt-2">新增 PTT 文章進行分析，或查看過往紀錄。</p>
      </header>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="ptt-url" className="block text-sm font-medium text-gray-300 mb-2">新增文章網址</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="url" id="ptt-url" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-grow bg-gray-900 border border-gray-600 text-white rounded-md p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="https://www.ptt.cc/bbs/..." required />
            <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              新增並分析
            </button>
          </div>
        </form>
      </div>
      {isLoading && <LoadingSpinner message={loadingMessage} />}
      {error && <ErrorMessage message={error} />}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">已存分析紀錄</h2>
        <div className="space-y-4">
          {analyses.length > 0 ? (
            analyses.map(analysis => (
              <div key={analysis.id} onClick={() => handleSelectAnalysis(analysis.id)} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition-colors">
                <div>
                  <p className="font-semibold text-white">{analysis.data.article_title || '無標題分析'}</p>
                  <p className="text-sm text-gray-400">{analysis.url}</p>
                </div>
                <span className="text-sm text-gray-300">{new Date(analysis.date).toLocaleDateString('en-CA')}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">尚無分析紀錄，請在上方新增一筆。</p>
          )}
        </div>
      </div>
    </div>
  );
};