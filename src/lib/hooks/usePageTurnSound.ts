"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PAGE_TURN_AUDIO_ENABLED,
  PAGE_TURN_AUDIO_SRC,
} from "@/lib/work/book-audio-config";

const STORAGE_KEY = "eflin-book-sound-enabled";
const VOLUME = 0.22;

export function usePageTurnSound(defaultEnabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockStartedRef = useRef(false);
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [available, setAvailable] = useState(PAGE_TURN_AUDIO_ENABLED);
  const [probed] = useState(!PAGE_TURN_AUDIO_ENABLED);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "0") setEnabled(false);
    if (stored === "1") setEnabled(true);
  }, []);

  const unlock = useCallback(() => {
    if (!PAGE_TURN_AUDIO_ENABLED || unlockStartedRef.current) return;
    unlockStartedRef.current = true;

    const audio = new Audio(PAGE_TURN_AUDIO_SRC);
    audio.volume = VOLUME;
    audio.preload = "none";
    audio.addEventListener("error", () => setAvailable(false), { once: true });
    audio.addEventListener("canplaythrough", () => setAvailable(true), { once: true });
    audioRef.current = audio;
    audio.load();
  }, []);

  const toggle = useCallback(() => {
    if (!available) return;
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, [available]);

  const play = useCallback(() => {
    if (!PAGE_TURN_AUDIO_ENABLED || !enabled || !available) return;
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
    } catch {
      // Silent — audio must never block navigation.
    }
  }, [available, enabled]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, []);

  return { enabled, available, probed, unlock, toggle, play };
}
