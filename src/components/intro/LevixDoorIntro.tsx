import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LevixLogo } from './LevixLogo';
import './LevixDoorIntro.css';

export interface LevixDoorIntroProps {
  /** Callback fired once the doors have fully swung open */
  onComplete?: () => void;
  /** Whether to automatically start opening after pause (default: true) */
  autoPlay?: boolean;
  /** Pause duration before doors begin opening in milliseconds (default: 900) */
  pauseDuration?: number;
  /** Duration of the door swinging animation in milliseconds (default: 1700) */
  openDuration?: number;
  /** Whether clicking the opened background replays the intro (default: false when children present) */
  allowReplayOnClick?: boolean;
  /** Optional state override for manual testing */
  forceState?: 'closed' | 'opening' | 'opened';
  /** Optional custom CSS class name */
  className?: string;
  /** Child content rendered directly behind the doors */
  children?: React.ReactNode;
}

export type AnimationState = 'closed' | 'opening' | 'opened';

/**
 * LevixDoorIntro Component
 * 
 * Fullscreen 3D architectural dual-door opening entrance for LEVIX.
 * - Deep Obsidian and Matte Carbon Panels (#09090B)
 * - Precision Brushed Titanium Accents (#E4E4E7)
 * - Symmetrical 3D Hinged Outward Rotation around outer vertical edges (1400px perspective)
 * - Tap to enter instant override
 * - Fully unmounts door overlay once opened for 100% interactive storefront performance
 */
export const LevixDoorIntro: React.FC<LevixDoorIntroProps> = ({
  onComplete,
  autoPlay = true,
  pauseDuration = 900,
  openDuration = 1700,
  allowReplayOnClick = false,
  forceState,
  className = '',
  children,
}) => {
  const getInitialState = (): AnimationState => {
    if (forceState) return forceState;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stateParam = params.get('door');
      if (stateParam === 'opened') return 'opened';
      if (stateParam === 'closed' || stateParam === 'opening') {
        return stateParam as AnimationState;
      }
      if (sessionStorage.getItem('levix_door_opened') === 'true') {
        return 'opened';
      }
    }
    return 'closed';
  };

  const [animState, setAnimState] = useState<AnimationState>(getInitialState);
  const timerRef = useRef<number | null>(null);
  const completionTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  }, []);

  const triggerOpen = useCallback(() => {
    clearTimers();
    setAnimState('opening');

    completionTimerRef.current = window.setTimeout(() => {
      setAnimState('opened');
      onComplete?.();
    }, openDuration);
  }, [clearTimers, onComplete, openDuration]);

  // Lifecycle timer for autoPlay
  useEffect(() => {
    if (forceState) {
      setAnimState(forceState);
      return;
    }

    if (!autoPlay) return;

    timerRef.current = window.setTimeout(() => {
      setAnimState('opening');

      completionTimerRef.current = window.setTimeout(() => {
        setAnimState('opened');
        onComplete?.();
      }, openDuration);
    }, pauseDuration);

    return () => {
      clearTimers();
    };
  }, [autoPlay, forceState, pauseDuration, openDuration, onComplete, clearTimers]);

  // Tap anywhere while closed to open immediately
  const handleContainerClick = () => {
    if (animState === 'closed') {
      triggerOpen();
    } else if (animState === 'opened' && allowReplayOnClick && !children) {
      setAnimState('closed');
      window.setTimeout(() => {
        triggerOpen();
      }, 400);
    }
  };

  const isOpeningOrOpened = animState === 'opening' || animState === 'opened';
  const isFullyOpened = animState === 'opened';

  return (
    <div
      className={`levix-intro-root ${isFullyOpened ? 'is-opened' : ''} ${className}`}
      onClick={handleContainerClick}
      role="region"
      aria-label="LEVIX Architectural Streetwear Portal"
      style={{ cursor: animState === 'closed' ? 'pointer' : undefined }}
    >
      {/* 1. Revealed Stage Behind the Doors */}
      <div
        className={`levix-revealed-stage ${isFullyOpened ? 'is-interactive' : ''}`}
        aria-hidden={animState === 'closed'}
      >
        {children}
      </div>

      {/* 2. 3D Hinged Door Viewport */}
      {!isFullyOpened && (
        <div className="levix-doors-viewport" aria-hidden="true">
          {/* Left Door Panel: Hinged at the outer left edge (x = 0) */}
          <div
            className={`levix-door-panel levix-door-left ${
              isOpeningOrOpened ? 'is-opening' : ''
            }`}
            style={{
              transitionDuration: `${openDuration}ms`,
            }}
          >
            {/* Subtle titanium inner trim on meeting edge */}
            <div className="levix-door-inner-edge-left" />
          </div>

          {/* Right Door Panel: Hinged at the outer right edge (x = 100%) */}
          <div
            className={`levix-door-panel levix-door-right ${
              isOpeningOrOpened ? 'is-opening' : ''
            }`}
            style={{
              transitionDuration: `${openDuration}ms`,
            }}
          >
            {/* Subtle titanium inner trim on meeting edge */}
            <div className="levix-door-inner-edge-right" />
          </div>
        </div>
      )}

      {/* 3. Center Laser Seam */}
      {!isFullyOpened && (
        <div
          className={`levix-center-seam ${isOpeningOrOpened ? 'is-faded' : ''}`}
          aria-hidden="true"
        />
      )}

      {/* 4. Center Brand Monogram & Typography Layer */}
      {!isFullyOpened && (
        <div
          className={`levix-logo-layer ${isOpeningOrOpened ? 'is-faded' : ''}`}
          aria-hidden={isOpeningOrOpened}
        >
          <div className="levix-emblem-badge">
            <LevixLogo size={52} />
          </div>

          <div className="text-center space-y-2 px-4">
            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-5xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_2px_15px_rgba(255,255,255,0.3)]">
              L E V I X
            </h1>
            <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-neutral-400 uppercase">
              Architectural Streetwear // Est. 2026
            </p>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                240 GSM DROP 04 ONLINE
              </span>
            </div>
          </div>

          {/* Tap / Click cue */}
          <div className="levix-door-tap-hint">
            <span>Tap to Enter</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevixDoorIntro;
