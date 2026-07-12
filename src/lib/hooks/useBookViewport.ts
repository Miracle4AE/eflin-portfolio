"use client";

import { useEffect, useState } from "react";

export function useBookViewport() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSpreadView, setIsSpreadView] = useState(true);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const spreadQuery = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      setIsMobile(mobileQuery.matches);
      setIsSpreadView(spreadQuery.matches);
    };

    update();
    mobileQuery.addEventListener("change", update);
    spreadQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      spreadQuery.removeEventListener("change", update);
    };
  }, []);

  return { isMobile, isSpreadView, isSinglePage: !isSpreadView };
}
