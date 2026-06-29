"use client";

import { useEffect, useState } from "react";

export function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    setFine(media.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setFine(event.matches);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return fine;
}
