import { type NextRequest, NextResponse } from "next/server"
import { SpeechClient } from "@google-cloud/speech"

export const runtime = "nodejs" // Vercel対応：Edge Functions不可なのでNode.jsで明示

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "音声ファイルが見つかりません" }, { status: 400 })
    }

    const audioBuffer = await audioFile.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    // Vercel環境変数から認証情報を取得
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || "{}")
    const client = new SpeechClient({ credentials })

    // Google Speech-to-Text API 呼び出し
    const [response] = await client.recognize({
      audio: {
        content: audioBase64,
      },
      config: {
        encoding: "WEBM_OPUS", // 音声形式に応じて変更（例: "LINEAR16"）
        sampleRateHertz: 48000,
        languageCode: "ja-JP",
      },
    })

    const transcript = response.results
      ?.map((result) => result.alternatives?.[0].transcript)
      .join("\n")

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("文字起こしエラー:", error)
    return NextResponse.json({ error: "文字起こし処理中にエラーが発生しました" }, { status: 500 })
  }
}
