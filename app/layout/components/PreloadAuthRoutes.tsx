// components/PreloadAuthRoutes.tsx
"use client";
import { useEffect } from "react";

export default function PreloadAuthRoutes() {
  useEffect(() => {
    const prefetchWithWebAPI = (path: string) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = path;
      document.head.appendChild(link);
    };

    const prefetchWithNext = async () => {
      try {
        const router = await import("next/navigation");
        if ("preload" in router) {
          (router as any).preload("/login");
          (router as any).preload("/signup");
          (router as any).preload("/reset-password");
        }
      } catch (e) {
        console.debug("Next.js preload not available", e);
      }
    };

    prefetchWithWebAPI("/login");
    prefetchWithWebAPI("/signup");
    prefetchWithNext();
  }, []);

  return null;
}
