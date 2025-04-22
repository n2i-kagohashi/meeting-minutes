import { type NextRequest, NextResponse } from "next/server"
import { summarizeTranscript } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { transcript, meetingInfo } = await request.json()

    if (!transcript || !meetingInfo) {
      return NextResponse.json({ error: "文字起こしまたは会議情報が不足しています" }, { status: 400 })
    }

    const summary = await summarizeTranscript(transcript, meetingInfo)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("要約エラー:", error)
    return NextResponse.json({ error: "要約処理中にエラーが発生しました" }, { status: 500 })
  }
}
