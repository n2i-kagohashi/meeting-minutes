"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Loader2 } from "lucide-react"

interface AudioRecorderProps {
  onTranscriptReady: (transcript: string) => void
  isProcessing: boolean
}

export function AudioRecorder({ onTranscriptReady, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        chunksRef.current = []

        // ストリームのトラックを停止
        stream.getTracks().forEach((track) => track.stop())
      }

      chunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)

      // 録音時間のカウント開始
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("マイクへのアクセスができませんでした:", err)
      alert("マイクへのアクセスができませんでした。ブラウザの設定を確認してください。")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleTranscribe = async () => {
    if (!audioBlob) return

    const formData = new FormData()
    formData.append("audio", audioBlob)

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("文字起こし処理に失敗しました")
      }

      const data = await response.json()
      onTranscriptReady(data.transcript)
    } catch (error) {
      console.error("文字起こしエラー:", error)
      alert("文字起こし処理中にエラーが発生しました。")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {isRecording ? (
            <div className="flex items-center text-red-500">
              <span className="animate-pulse mr-2">●</span> 録音中: {formatTime(recordingTime)}
            </div>
          ) : audioBlob ? (
            <div>録音完了 ({formatTime(recordingTime)})</div>
          ) : (
            <div>録音準備完了</div>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording ? (
          <Button onClick={startRecording} disabled={isProcessing} className="flex items-center gap-2">
            <Mic size={16} />
            録音開始
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
            <Square size={16} />
            録音停止
          </Button>
        )}

        {audioBlob && !isRecording && (
          <Button onClick={handleTranscribe} disabled={isProcessing} variant="outline">
            {isProcessing ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                処理中...
              </>
            ) : (
              "文字起こし開始"
            )}
          </Button>
        )}
      </div>

      {audioBlob && (
        <div className="mt-4">
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
        </div>
      )}
    </div>
  )
}
