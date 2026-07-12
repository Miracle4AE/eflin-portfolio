"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "eflin-book-sound-enabled";
const AUDIO_SRC = "/audio/page-turn.mp3";
const VOLUME = 0.22;

let audioProbePromise: Promise<boolean> | null = null;

async function probeAudioAsset(): Promise<boolean> {
  if (audioProbePromise) return audioProbePromise;
  audioProbePromise = (async () => {
    try {
      const response = await fetch(AUDIO_SRC, { method: "HEAD", cache: "no-store" });
      return response.ok;
    } catch {
      return false;
    }
  })();
  return audioProbePromise;
}

export function usePageTurnSound(defaultEnabled = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const probeStartedRef = useRef(false);
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [unlocked, setUnlocked] = useState(false);
  const [available, setAvailable] = useState(false);
  const [probed, setProbed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "0") setEnabled(false);
    if (stored === "1") setEnabled(true);
  }, []);

  const unlock = useCallback(async () => {
    if (unlocked || probeStartedRef.current) return;
    probeStartedRef.current = true;
    const exists = await probeAudioAsset();
    setProbed(true);
    setUnlocked(true);
    if (!exists) {
      setAvailable(false);
      return;
    }
    const audio = new Audio(AUDIO_SRC);
    audio.volume = VOLUME;
    audio.preload = "auto";
    audio.addEventListener(
      "error",
      () => setAvailable(false),
      { once: true },
    );
    audio.addEventListener(
      "canplaythrough",
      () => setAvailable(true),
      { once: true },
    );
    audioRef.current = audio;
    audio.load();
  }, [unlocked]);

  const toggle = useCallback(() => {
    if (!available) return;
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, [available]);

  const play = useCallback(() => {
    if (!enabled || !unlocked || !available) return;
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play().catch(() => {
        setAvailable(false);
      });
    } catch {
      setAvailable(false);
    }
  }, [available, enabled, unlocked]);

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

  return { enabled, available, unlocked, probed, unlock, toggle, play };
}
