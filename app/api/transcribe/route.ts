import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "音声ファイルが見つかりません" }, { status: 400 })
    }

    // ここでは簡易的な実装として、実際の文字起こしの代わりにダミーテキストを返します
    // 実際のアプリケーションでは、Google Speech-to-Text APIなどを使用します

    // 実際の実装では以下のようなコードになります
    /*
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    
    const response = await fetch("https://speech.googleapis.com/v1/speech:recognize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        config: {
          encoding: "WEBM_OPUS",
          sampleRateHertz: 48000,
          languageCode: "ja-JP",
        },
        audio: {
          content: audioBase64,
        },
      }),
    });
    
    const data = await response.json();
    const transcript = data.results
      .map((result: any) => result.alternatives[0].transcript)
      .join("\n");
    */

    // デモ用のダミーテキスト
    const dummyTranscript = `
山田: 皆さん、お忙しい中お集まりいただきありがとうございます。今日は新製品の販売戦略について話し合いたいと思います。

佐藤: はい、前回のミーティングで決まった予算配分について確認したいのですが。

山田: そうですね。マーケティング予算は全体の40%、研究開発に30%、残りを運営費に充てることになっていました。

田中: その配分で進めていますが、最近のマーケット調査によると、競合他社が新しい技術を導入しているようです。我々も研究開発費を増やすべきではないでしょうか？

山田: 良い指摘ですね。では研究開発費を35%に増やし、マーケティングを35%に調整するのはどうでしょう？

佐藤: 賛成です。ただ、新製品のローンチタイミングについても決めておく必要があります。

山田: そうですね。第3四半期の初めを目標にしていましたが、皆さんの意見はいかがですか？

田中: 研究開発の進捗を考えると、もう少し余裕を持たせて第3四半期の終わりにしたほうが良いと思います。

山田: わかりました。では第3四半期末をローンチ目標とします。佐藤さん、マーケティングチームでプロモーション計画を立てていただけますか？

佐藤: 承知しました。2週間以内に計画書を提出します。

山田: ありがとうございます。田中さんは研究開発チームと連携して、スケジュールの調整をお願いします。

田中: 了解しました。来週の月曜日までに開発ロードマップを更新します。

山田: 素晴らしい。では次回のミーティングは2週間後の水曜日、同じ時間でよろしいでしょうか？

佐藤: はい、大丈夫です。

田中: 私も問題ありません。

山田: では、本日はこれで終了します。皆さん、ありがとうございました。
`

    // 処理時間をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({ transcript: dummyTranscript })
  } catch (error) {
    console.error("文字起こしエラー:", error)
    return NextResponse.json({ error: "文字起こし処理中にエラーが発生しました" }, { status: 500 })
  }
}
