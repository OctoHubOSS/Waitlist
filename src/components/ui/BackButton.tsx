'use client';

import React from 'react';

export default function BackButton() {
  return (
    <button 
      onClick={() => window.history.back()}
      className="flex-1 py-2 px-4 bg-transparent text-white border border-github-border rounded-md hover:bg-github-dark hover:border-github-link transition-colors"
    >
      Go Back
    </button>
  );
}
