import React from 'react';

export default function Footer() {
  return (
    <footer className="py-6 text-center text-gray-500 border-t border-gray-200 mt-8">
      <div className="container mx-auto px-4">
        <p>
          © {new Date().getFullYear()} Sarvārth Icon Library
        </p>
      </div>
    </footer>
  );
} 