"use client";

type PageTurnControlsProps = {
  previousLabel: string;
  nextLabel: string;
  closeLabel: string;
  soundOnLabel: string;
  soundOffLabel: string;
  soundUnavailableLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  soundEnabled: boolean;
  soundAvailable: boolean;
  soundProbed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleSound: () => void;
};

export function PageTurnControls({
  previousLabel,
  nextLabel,
  closeLabel,
  soundOnLabel,
  soundOffLabel,
  soundUnavailableLabel,
  canGoBack,
  canGoForward,
  soundEnabled,
  soundAvailable,
  soundProbed,
  onPrevious,
  onNext,
  onClose,
  onToggleSound,
}: PageTurnControlsProps) {
  const buttonClass =
    "rounded-full border border-border-soft bg-surface/70 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition hover:border-accent/35 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <button type="button" className={buttonClass} onClick={onPrevious} disabled={!canGoBack}>
        {previousLabel}
      </button>
      <button type="button" className={buttonClass} onClick={onNext} disabled={!canGoForward}>
        {nextLabel}
      </button>
      <button type="button" className={buttonClass} onClick={onClose}>
        {closeLabel}
      </button>
      {soundAvailable ? (
        <button
          type="button"
          className={buttonClass}
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? soundOnLabel : soundOffLabel}
        >
          {soundEnabled ? soundOnLabel : soundOffLabel}
        </button>
      ) : soundProbed ? (
        <button
          type="button"
          className={buttonClass}
          disabled
          title={soundUnavailableLabel}
          aria-label={soundUnavailableLabel}
        >
          {soundOffLabel}
        </button>
      ) : null}
    </div>
  );
}
