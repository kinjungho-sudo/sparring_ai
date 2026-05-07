'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { TTSVoice } from '@/types'

interface TTSOptions {
  speaker: 'red' | 'blue'
  lang?: string
  voice?: TTSVoice
}

interface QueueItem {
  text: string
  options: TTSOptions
  onDone?: () => void
}

// 어조별 기본 목소리 (RED/BLUE × tone)
export const TONE_VOICE_MAP: Record<string, { red: TTSVoice; blue: TTSVoice }> = {
  assertive:  { red: 'onyx',    blue: 'echo'    },
  analytical: { red: 'echo',    blue: 'alloy'   },
  emotional:  { red: 'fable',   blue: 'nova'    },
  socratic:   { red: 'shimmer', blue: 'fable'   },
  default:    { red: 'onyx',    blue: 'nova'    },
}

export const VOICE_LABELS: Record<TTSVoice, string> = {
  alloy:   'Alloy — 중성·균형',
  echo:    'Echo — 낮고 차분',
  fable:   'Fable — 따뜻·이야기',
  onyx:    'Onyx — 깊고 권위',
  nova:    'Nova — 밝고 명확',
  shimmer: 'Shimmer — 부드럽고 사색적',
}

const QUALITY_KEYWORDS = ['neural', 'premium', 'enhanced', 'natural', 'wavenet', 'studio']

export function cleanForTTS(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_{1,3}(.+?)_{1,3}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/^-{3,}$/gm, '')
    .replace(/^={3,}$/gm, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/>{1,}\s*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function pickBrowserVoice(voices: SpeechSynthesisVoice[], lang: string, preferIndex: number): SpeechSynthesisVoice | null {
  const langCode = lang.slice(0, 2)
  const langVoices = voices.filter((v) => v.lang.startsWith(langCode))
  if (langVoices.length === 0) return null
  const highQuality = langVoices.filter((v) => QUALITY_KEYWORDS.some((kw) => v.name.toLowerCase().includes(kw)))
  const pool = highQuality.length > 0 ? highQuality : langVoices
  return pool[preferIndex % pool.length] ?? pool[0]
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const openaiAvailableRef = useRef<boolean | null>(null)
  const ttsEnabledRef = useRef(false)

  // 직렬 큐
  const queueRef = useRef<QueueItem[]>([])
  const isProcessingRef = useRef(false)

  // pause/resume용
  const pauseResolveRef = useRef<(() => void) | null>(null)
  const isPausedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    setIsSupported(true)
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) voicesRef.current = v
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const setTtsEnabledSync = useCallback((enabled: boolean) => {
    ttsEnabledRef.current = enabled
    setTtsEnabled(enabled)
  }, [])

  const playSingle = useCallback(async (text: string, options: TTSOptions): Promise<void> => {
    const cleaned = cleanForTTS(text)
    if (!cleaned) return

    if (openaiAvailableRef.current === false) {
      return playBrowser(cleaned, options)
    }

    try {
      setIsSpeaking(true)
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, voice: options.voice }),
      })

      if (!resp.ok) {
        openaiAvailableRef.current = false
        setIsSpeaking(false)
        return playBrowser(cleaned, options)
      }

      openaiAvailableRef.current = true
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)

      return new Promise<void>((resolve) => {
        const audio = new Audio(url)
        audioRef.current = audio
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          setIsSpeaking(false)
          setIsPaused(false)
          isPausedRef.current = false
          URL.revokeObjectURL(url)
          audioRef.current = null
          pauseResolveRef.current = null
          resolve()
        }
        audio.onended = done
        audio.onerror = done
        audio.play().catch(done)
      })
    } catch {
      openaiAvailableRef.current = false
      setIsSpeaking(false)
      return playBrowser(cleaned, options)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function playBrowser(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(); return }
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = options.lang === 'en' ? 'en-US' : 'ko-KR'
      utter.rate = options.speaker === 'red' ? 0.92 : 1.0
      utter.pitch = options.speaker === 'red' ? 0.80 : 1.15
      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices()
      const voice = pickBrowserVoice(voices, utter.lang, options.speaker === 'red' ? 0 : 1)
      if (voice) utter.voice = voice
      utter.onstart = () => setIsSpeaking(true)
      utter.onend = () => { setIsSpeaking(false); setIsPaused(false); resolve() }
      utter.onerror = () => { setIsSpeaking(false); setIsPaused(false); resolve() }
      window.speechSynthesis.speak(utter)
    })
  }

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      while (queueRef.current.length > 0) {
        if (!ttsEnabledRef.current) {
          queueRef.current = []
          break
        }
        const item = queueRef.current.shift()!
        try {
          await playSingle(item.text, item.options)
        } catch {
          // 개별 항목 실패해도 큐 계속 처리
        }
        item.onDone?.()
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [playSingle])

  const speak = useCallback((text: string, options: TTSOptions, onDone?: () => void): Promise<void> => {
    if (!ttsEnabledRef.current) {
      onDone?.()
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      queueRef.current.push({
        text,
        options,
        onDone: () => { onDone?.(); resolve() },
      })
      processQueue()
    })
  }, [processQueue])

  const pause = useCallback(() => {
    if (!isSpeaking || isPausedRef.current) return
    if (audioRef.current) {
      audioRef.current.pause()
      isPausedRef.current = true
      setIsPaused(true)
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause()
      isPausedRef.current = true
      setIsPaused(true)
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    if (!isPausedRef.current) return
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
      isPausedRef.current = false
      setIsPaused(false)
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume()
      isPausedRef.current = false
      setIsPaused(false)
    }
  }, [])

  const stop = useCallback(() => {
    queueRef.current = []
    isProcessingRef.current = false
    isPausedRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
  }, [])

  return { speak, stop, pause, resume, isSpeaking, isPaused, ttsEnabled, setTtsEnabled: setTtsEnabledSync, isSupported }
}
