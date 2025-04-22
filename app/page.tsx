import { MeetingForm } from "@/components/meeting-form"

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">対面営業議事録作成アプリ</h1>
          <p className="mt-2 text-muted-foreground">会議の録音から文字起こしと要約を自動生成</p>
        </div>

        <MeetingForm />
      </div>
    </div>
  )
}
