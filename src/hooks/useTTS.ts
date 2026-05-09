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
  msgId?: string
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

export const TTS_SPEEDS = [1.0, 1.25, 1.5, 1.75, 2.0] as const
export type TTSSpeed = typeof TTS_SPEEDS[number]

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [speed, setSpeed] = useState<TTSSpeed>(1.0)
  const [ttsSpeaker, setTtsSpeaker] = useState<'red' | 'blue' | null>(null)
  const [volume, setVolume] = useState(1.0)
  const [isMuted, setIsMuted] = useState(false)

  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const openaiAvailableRef = useRef<boolean | null>(null)
  const ttsEnabledRef = useRef(false)
  const speedRef = useRef<TTSSpeed>(1.0)
  const volumeRef = useRef(1.0)
  const isMutedRef = useRef(false)

  const setSpeedSync = useCallback((s: TTSSpeed) => {
    speedRef.current = s
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }, [])

  const setVolumeSync = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    volumeRef.current = clamped
    setVolume(clamped)
    if (audioRef.current) audioRef.current.volume = isMutedRef.current ? 0 : clamped
  }, [])

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current
    isMutedRef.current = next
    setIsMuted(next)
    if (audioRef.current) audioRef.current.volume = next ? 0 : volumeRef.current
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // SpeechSynthesis는 volume 직접 제어 불가 — 음소거 시 cancel로 처리
      if (next) window.speechSynthesis.cancel()
    }
  }, [])

  // 직렬 큐
  const queueRef = useRef<QueueItem[]>([])
  const isProcessingRef = useRef(false)

  // stop() 호출 시 진행 중인 playSingle을 즉시 settle하기 위한 세대(generation) 카운터
  // playSingle 시작 시점의 세대와 현재 세대가 다르면 이미 stop()된 것으로 간주
  const generationRef = useRef(0)

  // pause/resume용
  const pauseResolveRef = useRef<(() => void) | null>(null)
  const isPausedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Audio 재생 가능하면 TTS 지원 (OpenAI TTS는 SpeechSynthesis 불필요)
    setIsSupported(true)
    if (!('speechSynthesis' in window)) return
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

    // 이 playSingle이 시작될 때의 세대를 캡처 — stop() 호출 시 세대가 바뀌면 즉시 포기
    const myGeneration = generationRef.current

    if (openaiAvailableRef.current === false) {
      if (generationRef.current !== myGeneration) return
      return playBrowser(cleaned, options, myGeneration)
    }

    try {
      setIsSpeaking(true)
      setTtsSpeaker(options.speaker)
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, voice: options.voice }),
      })

      // fetch 중 stop()이 불렸으면 버림
      if (generationRef.current !== myGeneration) {
        setIsSpeaking(false)
        setTtsSpeaker(null)
        return
      }

      if (!resp.ok) {
        openaiAvailableRef.current = false
        setIsSpeaking(false)
        return playBrowser(cleaned, options, myGeneration)
      }

      openaiAvailableRef.current = true

      // fetch 중 stop()이 불렸으면 버림
      if (generationRef.current !== myGeneration) {
        setIsSpeaking(false)
        setTtsSpeaker(null)
        return
      }

      // 스트리밍: 전체 다운로드 없이 즉시 재생
      const mediaSource = (typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('audio/mpeg'))
        ? new MediaSource()
        : null

      if (mediaSource && resp.body) {
        const url = URL.createObjectURL(mediaSource)
        return new Promise<void>((resolve) => {
          const audio = new Audio(url)
          audio.playbackRate = speedRef.current
          audio.volume = isMutedRef.current ? 0 : volumeRef.current
          audioRef.current = audio
          let settled = false
          const done = () => {
            if (settled) return
            settled = true
            if (generationRef.current === myGeneration) {
              setIsSpeaking(false); setIsPaused(false); setTtsSpeaker(null)
              isPausedRef.current = false; audioRef.current = null; pauseResolveRef.current = null
            }
            URL.revokeObjectURL(url)
            resolve()
          }
          mediaSource.addEventListener('sourceopen', () => {
            const sb = mediaSource.addSourceBuffer('audio/mpeg')
            const reader = resp.body!.getReader()
            const pump = async () => {
              try {
                while (true) {
                  const { done: streamDone, value } = await reader.read()
                  if (generationRef.current !== myGeneration) { reader.cancel(); mediaSource.endOfStream(); done(); return }
                  if (streamDone) { mediaSource.endOfStream(); break }
                  await new Promise<void>((r) => {
                    if (!sb.updating) { sb.appendBuffer(value); sb.addEventListener('updateend', () => r(), { once: true }) }
                    else { sb.addEventListener('updateend', () => { sb.appendBuffer(value); sb.addEventListener('updateend', () => r(), { once: true }) }, { once: true }) }
                  })
                }
              } catch { mediaSource.endOfStream() }
            }
            pump()
          })
          audio.onended = done
          audio.onerror = done
          audio.play().catch(done)
        })
      }

      // MediaSource 미지원 폴백 — blob 전체 수신
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      if (generationRef.current !== myGeneration) { URL.revokeObjectURL(url); setIsSpeaking(false); setTtsSpeaker(null); return }
      return new Promise<void>((resolve) => {
        const audio = new Audio(url)
        audio.playbackRate = speedRef.current
        audio.volume = isMutedRef.current ? 0 : volumeRef.current
        audioRef.current = audio
        let settled = false
        const done = () => {
          if (settled) return
          settled = true
          if (generationRef.current === myGeneration) {
            setIsSpeaking(false); setIsPaused(false); setTtsSpeaker(null)
            isPausedRef.current = false; audioRef.current = null; pauseResolveRef.current = null
          }
          URL.revokeObjectURL(url)
          resolve()
        }
        audio.onended = done
        audio.onerror = done
        audio.play().catch(done)
      })
    } catch {
      openaiAvailableRef.current = false
      if (generationRef.current === myGeneration) setIsSpeaking(false)
      if (generationRef.current !== myGeneration) return
      return playBrowser(cleaned, options, myGeneration)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function playBrowser(text: string, options: TTSOptions, myGeneration: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) { resolve(); return }
      if (isMutedRef.current) { resolve(); return }
      if (generationRef.current !== myGeneration) { resolve(); return }
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.volume = volumeRef.current
      utter.lang = options.lang === 'en' ? 'en-US' : 'ko-KR'
      utter.rate = (options.speaker === 'red' ? 0.92 : 1.0) * speedRef.current
      utter.pitch = options.speaker === 'red' ? 0.80 : 1.15
      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices()
      const voice = pickBrowserVoice(voices, utter.lang, options.speaker === 'red' ? 0 : 1)
      if (voice) utter.voice = voice
      utter.onstart = () => {
        if (generationRef.current !== myGeneration) { window.speechSynthesis.cancel(); return }
        setIsSpeaking(true); setTtsSpeaker(options.speaker)
      }
      utter.onend = () => {
        if (generationRef.current === myGeneration) { setIsSpeaking(false); setIsPaused(false); setTtsSpeaker(null) }
        resolve()
      }
      utter.onerror = () => {
        if (generationRef.current === myGeneration) { setIsSpeaking(false); setIsPaused(false); setTtsSpeaker(null) }
        resolve()
      }
      window.speechSynthesis.speak(utter)
    })
  }

  const setSpeakingMsgIdRef = useRef<((id: string | null) => void) | null>(null)

  const processQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      while (queueRef.current.length > 0) {
        const item = queueRef.current.shift()!
        if (item.msgId) setSpeakingMsgIdRef.current?.(item.msgId)
        try {
          await playSingle(item.text, item.options)
        } catch {
          // 개별 항목 실패해도 큐 계속 처리
        }
        item.onDone?.()
        // 다음 msgId 항목이 없으면 speakingMsgId 초기화
        if (item.msgId && !queueRef.current.find((q) => q.msgId)) {
          setSpeakingMsgIdRef.current?.(null)
        }
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
    // 세대를 올려서 현재 진행 중인 모든 playSingle이 즉시 포기하도록 함
    generationRef.current += 1
    queueRef.current = []
    isProcessingRef.current = false
    isPausedRef.current = false
    if (audioRef.current) {
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current.pause()
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsPaused(false)
    setTtsSpeaker(null)
  }, [])

  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null)
  // processQueue에서 setSpeakingMsgId를 호출할 수 있도록 ref로 연결
  setSpeakingMsgIdRef.current = setSpeakingMsgId

  // 개별 듣기 버튼: ttsEnabled 무관, 진행 중 재생 중단 후 단독 재생
  const speakMsg = useCallback((msgId: string, content: string, speaker: 'red' | 'blue', options: TTSOptions) => {
    stop()
    setSpeakingMsgId(msgId)
    playSingle(content, options).then(() => setSpeakingMsgId(null))
  }, [playSingle, stop])

  // 자동 TTS: ttsEnabled 무관, 큐에 순차 추가 (stop() 없이) — processQueue가 msgId 기반으로 speakingMsgId 관리
  const enqueueMsg = useCallback((msgId: string, text: string, options: TTSOptions) => {
    const cleaned = cleanForTTS(text)
    if (!cleaned) return
    queueRef.current.push({ text: cleaned, options, msgId })
    processQueue()
  }, [processQueue])

  return { speak, speakMsg, enqueueMsg, stop, pause, resume, isSpeaking, isPaused, ttsSpeaker, ttsEnabled, setTtsEnabled: setTtsEnabledSync, isSupported, speed, setSpeed: setSpeedSync, volume, setVolume: setVolumeSync, isMuted, toggleMute, speakingMsgId, setSpeakingMsgId }
}
