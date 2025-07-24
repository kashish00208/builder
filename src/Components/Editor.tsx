'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import getLanguageFromExtension from './Languatext';

const MonacoViewer = dynamic(() => import('./codeViewer'), { ssr: false });

const CodeEditor = () => {
  const [fileContent, setFileContent] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [language, setLanguage] = useState('plaintext');

  const files = ['file.txt', 'test.txt', 'new.tsx'];

  const handleFileClick = async (fileName: string) => {
    setSelectedFile(fileName);
    const res = await fetch(`/files/${fileName}`);
    const text = await res.text();
    setFileContent(text);
    setLanguage(getLanguageFromExtension(fileName));
  };

  return (
    <div className="flex h-screen font-mono bg-[#1e1e1e] text-gray-100">
      <div className="w-48 bg-[#252526] border-r border-gray-700 p-3">
        <h3 className="text-sm font-bold text-gray-300 mb-3 pb-1.5 border-b border-slate-600">
          EXPLORER
        </h3>
        <ul className="space-y-1">
          {files.map((file) => (
            <li key={file}>
              <button
                onClick={() => handleFileClick(file)}
                className={`w-full text-left px-2 py-1 rounded text-sm ${
                  selectedFile === file
                    ? 'bg-[#094771] text-white'
                    : 'hover:bg-[#333] text-gray-300'
                }`}
              >
                {file}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="bg-[#1e1e1e] border-b border-gray-700 px-4 py-2 text-sm font-semibold text-white">
          {selectedFile || 'Select a file'}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <textarea value={fileContent} readOnly={true}/>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;