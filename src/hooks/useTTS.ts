'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface TTSOptions {
  speaker: 'red' | 'blue'
  lang?: string
}

const RED_VOICE_PARAMS = { rate: 0.95, pitch: 0.85, volume: 1.0 }
const BLUE_VOICE_PARAMS = { rate: 1.0,  pitch: 1.2,  volume: 1.0 }

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  // Cache voices so Chrome's async load doesn't return empty array on first call
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) voicesRef.current = v
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const speak = useCallback((text: string, options: TTSOptions) => {
    if (!ttsEnabled) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const params = options.speaker === 'red' ? RED_VOICE_PARAMS : BLUE_VOICE_PARAMS
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = options.lang === 'en' ? 'en-US' : 'ko-KR'
    utter.rate = params.rate
    utter.pitch = params.pitch
    utter.volume = params.volume

    // Use cached voices; fall back to live getVoices() if cache is still empty
    const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices()
    const langVoices = voices.filter((v) => v.lang.startsWith(utter.lang.slice(0, 2)))
    if (langVoices.length >= 2) {
      utter.voice = options.speaker === 'red' ? langVoices[0] : langVoices[1]
    } else if (langVoices.length === 1) {
      utter.voice = langVoices[0]
    }

    utter.onstart = () => setIsSpeaking(true)
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)

    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [ttsEnabled])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
  }, [])

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  return { speak, stop, isSpeaking, ttsEnabled, setTtsEnabled, isSupported }
}
