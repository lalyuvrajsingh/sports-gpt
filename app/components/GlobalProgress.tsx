'use client';

import { useEffect, useState } from 'react';

interface GlobalProgressProps {
  isLoading: boolean;
}

export default function GlobalProgress({ isLoading }: GlobalProgressProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;
    
    if (isLoading) {
      setProgress(0);
      
      // Start with small progress to indicate loading has begun
      timeoutId = setTimeout(() => {
        setProgress(10);
        
        // Gradually increase the progress
        intervalId = setInterval(() => {
          setProgress(prevProgress => {
            if (prevProgress >= 90) {
              clearInterval(intervalId);
              return 90;
            }
            
            // Slow down as we get closer to 90%
            const increment = prevProgress < 30 ? 2 :
                              prevProgress < 60 ? 1 : 0.5;
            
            return Math.min(prevProgress + increment, 90);
          });
        }, 300);
      }, 100);
      
    } else if (progress > 0) {
      // Complete the progress bar when loading is done
      timeoutId = setTimeout(() => {
        setProgress(100);
        // Hide the bar after completion
        timeoutId = setTimeout(() => {
          setProgress(0);
        }, 500);
      }, 300);
    }
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isLoading, progress]);
  
  if (progress === 0) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div 
        className="h-0.5 bg-blue-600 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1
        }}
      />
    </div>
  );
} 