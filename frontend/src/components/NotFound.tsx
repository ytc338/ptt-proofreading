import React from 'react';
import Link from 'next/link';

interface NotFoundProps {
  message: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Not Found</h1>
        <p className="text-lg">{message}</p>
        <Link href="/" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>
      </div>
    </div>
  );
};