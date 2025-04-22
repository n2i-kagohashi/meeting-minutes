import { type NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "音声ファイルが見つかりません" }, { status: 400 })
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}")
    const client = new SpeechClient({ credentials })

    const [response] = await client.recognize({
      audio: { content: audioBase64 },
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: "ja-JP",
      },
    })

    const transcript = response.results
      ?.map((result) => result.alternatives?.[0].transcript)
      .join("\n")

    const summary = await summarizeWithGemini(transcript || "")

    return NextResponse.json({ transcript, summary })
  } catch (error) {
    console.error("Gemini要約エラー:", error)
    return NextResponse.json({ error: "処理中にエラーが発生しました" }, { status: 500 })
  }
}

// Gemini APIを使って要約する
async function summarizeWithGemini(text: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const result = await model.generateContent([
    { role: "user", parts: [{ text: `以下の議事録を要約してください。\n\n${text}` }] }
  ])

  const response = await result.response
  return response.text()
}