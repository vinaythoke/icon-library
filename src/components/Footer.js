import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 sm:py-6 text-center text-gray-500 border-t border-gray-200 mt-6 sm:mt-8">
      <div className="container mx-auto px-4">
        <p className="text-xs sm:text-sm flex flex-col sm:flex-row justify-center items-center">
          <span>© {new Date().getFullYear()} Sarvārth Icon Library</span>
          <span className="hidden sm:inline mx-2">•</span>
          <span className="mt-1 sm:mt-0">Made with ❤️ for Sarvārth</span>
        </p>
        <div className="mt-2 text-xs">
          <span className="text-gray-400">App Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
} 