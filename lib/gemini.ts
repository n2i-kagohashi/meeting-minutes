import { GoogleGenerativeAI } from "@google/generative-ai"

// GoogleGenerativeAIのインスタンスを初期化
export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

// テキスト生成モデルを取得
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro" })
}

// 文字起こしを要約する関数
export async function summarizeTranscript(
  transcript: string,
  meetingInfo: {
    title: string
    agenda: string
    date: string
    location: string
    participants: string
    focusPoints: string
  },
) {
  const model = getGeminiModel()

  const prompt = `
以下は会議の文字起こしです。この内容を要約してください。

## 会議情報
会議名: ${meetingInfo.title}
アジェンダ: ${meetingInfo.agenda}
開催日時・場所: ${meetingInfo.date} at ${meetingInfo.location}
参加者: ${meetingInfo.participants}
要約してほしいこと: ${meetingInfo.focusPoints}

## 文字起こし
${transcript}

## 要約形式
以下の形式で要約してください：

1. 話し合ったこと（箇条書きで）
2. 決まったこと
3. 次にやることと担当者
4. その他のメモ
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error("Error summarizing with Gemini:", error)
    throw new Error("要約の生成中にエラーが発生しました")
  }
}
