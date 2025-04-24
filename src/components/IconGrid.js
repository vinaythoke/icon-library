import { useState, useEffect } from 'react';
import IconItem from './IconItem';

export default function IconGrid({ icons }) {
  const [visibleIcons, setVisibleIcons] = useState([]);
  const [observer, setObserver] = useState(null);
  const [containerRef, setContainerRef] = useState(null);

  // Initialize intersection observer for lazy loading
  useEffect(() => {
    if (!window.IntersectionObserver) {
      // Fallback for browsers that don't support IntersectionObserver
      setVisibleIcons(icons);
      return;
    }

    const newObserver = new IntersectionObserver(
      (entries) => {
        // If container is visible, render icons
        if (entries[0].isIntersecting) {
          setVisibleIcons(icons);
          newObserver.disconnect();
        }
      },
      { threshold: 0.1 } // Trigger when 10% of container is visible
    );

    setObserver(newObserver);

    return () => {
      if (newObserver) {
        newObserver.disconnect();
      }
    };
  }, []);

  // Observe container when ref and observer are available
  useEffect(() => {
    if (containerRef && observer) {
      observer.observe(containerRef);
    }

    return () => {
      if (containerRef && observer) {
        observer.unobserve(containerRef);
      }
    };
  }, [containerRef, observer]);

  // Update visible icons when icons prop changes
  useEffect(() => {
    // If the container is already visible, update visible icons immediately
    if (containerRef && observer) {
      const entry = { isIntersecting: true };
      observer.disconnect();
      observer.observe(containerRef);
    } else {
      setVisibleIcons(icons);
    }
  }, [icons]);

  return (
    <div ref={setContainerRef}>
      {icons.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visibleIcons.map(icon => (
            <IconItem key={icon.id} icon={icon} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No icons found. Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
} 