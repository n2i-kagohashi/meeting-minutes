"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { AudioRecorder } from "./audio-recorder"
import { MeetingSummary } from "./meeting-summary"

const formSchema = z.object({
  title: z.string().min(1, "会議名を入力してください"),
  agenda: z.string().min(1, "アジェンダを入力してください"),
  date: z.date(),
  location: z.string().min(1, "場所を入力してください"),
  participants: z.string().min(1, "参加者を入力してください"),
  focusPoints: z.string().min(1, "要約してほしいことを入力してください"),
})

export function MeetingForm() {
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      agenda: "",
      date: new Date(),
      location: "",
      participants: "",
      focusPoints: "",
    },
  })

  const handleTranscriptReady = (text: string) => {
    setTranscript(text)
  }

  const generateSummary = async () => {
    if (!transcript) {
      alert("文字起こしが必要です")
      return
    }

    setIsProcessing(true)

    try {
      const values = form.getValues()
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          meetingInfo: {
            title: values.title,
            agenda: values.agenda,
            date: format(values.date, "yyyy-MM-dd"),
            location: values.location,
            participants: values.participants,
            focusPoints: values.focusPoints,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("要約の生成に失敗しました")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("要約エラー:", error)
      alert("要約の生成中にエラーが発生しました。")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会議名</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 新規顧客商談" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>開催日</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "yyyy-MM-dd") : <span>日付を選択</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>場所</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 本社会議室A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>参加者</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 山田太郎、佐藤次郎" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="agenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>アジェンダ</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例: 1. 前回の振り返り 2. 新規提案の説明 3. 質疑応答"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="focusPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>要約してほしいこと</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例: 顧客の懸念点と次回までのアクションアイテム"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium">音声録音と文字起こし</h3>
        <AudioRecorder onTranscriptReady={handleTranscriptReady} isProcessing={isProcessing} />
      </div>

      {transcript && (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">文字起こし結果</h3>
            <Button onClick={generateSummary} disabled={isProcessing}>
              {isProcessing ? "要約生成中..." : "要約を生成"}
            </Button>
          </div>
          <div className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{transcript}</div>
        </div>
      )}

      {summary && <MeetingSummary summary={summary} />}
    </div>
  )
}
