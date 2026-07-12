"use client";

type PageTurnControlsProps = {
  previousLabel: string;
  nextLabel: string;
  closeLabel: string;
  soundOnLabel: string;
  soundOffLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  isAnimating: boolean;
  soundEnabled: boolean;
  soundAvailable: boolean;
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
  canGoBack,
  canGoForward,
  isAnimating,
  soundEnabled,
  soundAvailable,
  onPrevious,
  onNext,
  onClose,
  onToggleSound,
}: PageTurnControlsProps) {
  const buttonClass =
    "rounded-full border border-border-soft/80 bg-surface/55 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted transition hover:border-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-35";

  const backDisabled = !canGoBack || isAnimating;
  const forwardDisabled = !canGoForward || isAnimating;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <button
        type="button"
        className={buttonClass}
        onClick={onPrevious}
        disabled={backDisabled}
        aria-disabled={backDisabled}
      >
        {previousLabel}
      </button>
      <button
        type="button"
        className={buttonClass}
        onClick={onNext}
        disabled={forwardDisabled}
        aria-disabled={forwardDisabled}
      >
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
      ) : null}
    </div>
  );
}
