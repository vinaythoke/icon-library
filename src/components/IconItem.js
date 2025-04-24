import { useState, useEffect, useRef } from 'react';
import IconPreview from './IconPreview';

export default function IconItem({ icon }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Create an intersection observer for lazy loading
    if (!window.IntersectionObserver) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading when icon is within 200px of viewport
    );

    if (iconRef.current) {
      observer.observe(iconRef.current);
    }

    return () => {
      if (iconRef.current) {
        observer.unobserve(iconRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <>
      <div 
        ref={iconRef}
        className="bg-white rounded-lg p-2 xs:p-3 sm:p-4 shadow hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center aspect-square"
        onClick={() => setIsPreviewOpen(true)}
      >
        <div className="h-10 xs:h-12 sm:h-14 md:h-16 w-10 xs:w-12 sm:w-14 md:w-16 relative flex items-center justify-center">
          {/* Show loading placeholder until image is ready */}
          {(!isVisible || !isImageLoaded) && (
            <div className="h-6 w-6 xs:h-8 xs:w-8 bg-gray-200 rounded-full animate-pulse"></div>
          )}
          
          {/* Only load the image when the component is visible */}
          {isVisible && (
            <img 
              src={icon.svg} 
              alt={icon.name} 
              className={`max-h-full max-w-full object-contain transition-opacity duration-200 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          )}
        </div>
        <div className="mt-1 xs:mt-2 text-center w-full">
          <p className="text-xs xs:text-sm font-medium text-gray-900 truncate">
            {icon.displayName || icon.name}
          </p>
          <div className="flex flex-col">
            <p className="text-xs text-gray-500 capitalize truncate">{icon.category}</p>
            {icon.subcategory && (
              <p className="text-xs text-gray-400 truncate">
                {icon.subcategory.split('/').pop()}
              </p>
            )}
          </div>
        </div>
      </div>

      {isPreviewOpen && (
        <IconPreview 
          icon={icon} 
          onClose={() => setIsPreviewOpen(false)} 
        />
      )}
    </>
  );
} 