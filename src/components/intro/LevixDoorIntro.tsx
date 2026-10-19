import React, { useState, useEffect, useRef, useCallback } from 'react'
import './LevixDoorIntro.css'

export interface LevixDoorIntroProps {
  onComplete?: () => void
  autoPlay?: boolean
  pauseDuration?: number
  openDuration?: number
  className?: string
  children?: React.ReactNode
}

/**
 * Minimalist Luxury Door Opening Intro for LEVIX
 * Sleek, clean, high-fashion double doors parting to reveal the storefront.
 */
export const LevixDoorIntro: React.FC<LevixDoorIntroProps> = ({
  onComplete,
  autoPlay = true,
  pauseDuration = 600,
  openDuration = 1100,
  className = '',
  children,
}) => {
  const getInitialState = (): boolean => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('door') === 'opened') return true
      if (params.get('door') === 'closed') return false
      if (sessionStorage.getItem('levix_door_opened') === 'true') {
        return true
      }
    }
    return false
  }

  const [isOpened, setIsOpened] = useState<boolean>(getInitialState)
  const [isOpening, setIsOpening] = useState<boolean>(false)
  const timerRef = useRef<number | null>(null)

  const triggerOpen = useCallback(() => {
    if (isOpened || isOpening) return
    setIsOpening(true)

    window.setTimeout(() => {
      setIsOpened(true)
      try {
        sessionStorage.setItem('levix_door_opened', 'true')
      } catch (_) {}
      onComplete?.()
    }, openDuration)
  }, [isOpened, isOpening, onComplete, openDuration])

  useEffect(() => {
    if (isOpened) return
    if (!autoPlay) return

    timerRef.current = window.setTimeout(() => {
      triggerOpen()
    }, pauseDuration)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [autoPlay, isOpened, pauseDuration, triggerOpen])

  // Once fully opened, completely step out of the DOM for native performance
  if (isOpened) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <div
        className={`levix-door-overlay ${isOpening ? 'is-opening' : ''} ${className}`}
        onClick={triggerOpen}
        role="dialog"
        aria-label="Welcome to LEVIX"
      >
        {/* Left Luxury Door */}
        <div className="levix-door-half levix-door-left" />

        {/* Right Luxury Door */}
        <div className="levix-door-half levix-door-right" />

        {/* Center Minimal Typography */}
        <div className="levix-door-center-brand">
          <h1 className="levix-brand-title">LEVIX</h1>
          <p className="levix-brand-subtitle">CONTEMPORARY APPAREL</p>
          <span className="levix-brand-cue">Enter</span>
        </div>
      </div>
    </>
  )
}

export default LevixDoorIntro
