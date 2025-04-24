import { useState, useEffect } from 'react';

export default function Header() {
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
      return;
    }

    // Show install button only on supported browsers
    const isInstallable = 'BeforeInstallPromptEvent' in window || 
                         'onbeforeinstallprompt' in window || 
                         navigator.standalone === false;
    
    setShowInstallButton(isInstallable);
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 px-3 sm:px-4 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="h-8 w-8 sm:h-10 sm:w-10 mr-2">
            <img 
              src="/icons/app/icon-192x192.png" 
              alt="Icon Library" 
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-lg sm:text-xl font-heading font-semibold text-gray-900">
            Icon Library
          </h1>
        </div>
        
        <div className="flex items-center">
          {showInstallButton && (
            <button
              id="install-button"
              className="hidden bg-sarvarth-red hover:bg-red-600 text-white py-1 px-3 text-sm rounded-md transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install App
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 