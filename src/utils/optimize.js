/**
 * Performance optimization utility functions
 */

// Debounce function to limit the rate at which a function can fire
export function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Throttle function to ensure a function is called at most once in a specified time period
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images with Intersection Observer
export function lazyLoadImage(imageElement, src) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = src;
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px', // Load images when they're 200px from the viewport
    threshold: 0.01
  });
  
  observer.observe(imageElement);
  
  return () => {
    observer.unobserve(imageElement);
  };
}

// Prefetch critical resources
export function prefetchCriticalResources() {
  // Prefetch API data that will be needed immediately
  const prefetchLinks = [
    '/api/icons?limit=48&page=1' // Prefetch first page of results
  ];
  
  prefetchLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });
}

// Enable priority hints for critical content
export function enablePriorityHints() {
  if ('fetchPriority' in HTMLImageElement.prototype) {
    const criticalImages = document.querySelectorAll('.critical-image');
    criticalImages.forEach(img => {
      img.fetchPriority = 'high';
    });
  }
} 