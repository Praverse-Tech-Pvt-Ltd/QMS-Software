import { useEffect } from "react";
import { Box } from "@mui/material";

/**
 * Top-of-page loading progress bar
 * Inspired by: YouTube, GitHub, Next.js
 * Shows during page transitions and async operations
 */

interface LoadingBarProps {
  isLoading: boolean;
}

export default function LoadingBar({ isLoading }: LoadingBarProps) {
  useEffect(() => {
    if (!isLoading) return;

    const bar = document.getElementById("loading-bar");
    if (!bar) return;

    // Animate width from 0 to 90% over 2 seconds (never reaches 100% until done)
    let progress = 0;
    const increment = () => {
      progress += Math.random() * 10;
      if (progress > 90) progress = 90;
      bar.style.width = `${progress}%`;
    };

    const interval = setInterval(increment, 300);

    return () => {
      clearInterval(interval);
      // Complete the bar
      bar.style.width = "100%";
      setTimeout(() => {
        bar.style.opacity = "0";
        setTimeout(() => {
          bar.style.width = "0%";
          bar.style.opacity = "1";
        }, 200);
      }, 100);
    };
  }, [isLoading]);

  return (
    <Box
      id="loading-bar"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 3,
        bgcolor: "primary.main",
        zIndex: 9999,
        transition: "width 0.3s ease, opacity 0.2s ease",
        boxShadow: "0 0 10px rgba(99, 102, 241, 0.5)",
      }}
    />
  );
}

/**
 * Hook to manage loading bar state
 * Usage:
 * const loadingBar = useLoadingBar();
 * loadingBar.start();
 * // ... async operation
 * loadingBar.complete();
 */

let loadingCount = 0;
let loadingListeners: Set<(loading: boolean) => void> = new Set();

export function useLoadingBar() {
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    loadingListeners.add(setIsLoading);
    return () => {
      loadingListeners.delete(setIsLoading);
    };
  }, []);

  return {
    isLoading,
    start: () => {
      loadingCount++;
      loadingListeners.forEach((listener) => listener(true));
    },
    complete: () => {
      loadingCount = Math.max(0, loadingCount - 1);
      if (loadingCount === 0) {
        loadingListeners.forEach((listener) => listener(false));
      }
    },
  };
}

// Import React for useState
import React from "react";
