"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"

interface MeetingSummaryProps {
  summary: string
}

export function MeetingSummary({ summary }: MeetingSummaryProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Markdownの見出しを検出して適切なスタイルを適用
  const formatSummary = () => {
    const lines = summary.split("\n")
    return lines.map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <h2 key={index} className="text-xl font-bold mt-4 mb-2">
            {line.replace("# ", "")}
          </h2>
        )
      } else if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-lg font-semibold mt-3 mb-2">
            {line.replace("## ", "")}
          </h3>
        )
      } else if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-base font-medium mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        )
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.replace(/^[- *] /, "")}
          </li>
        )
      } else if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-4 list-decimal">
            {line.replace(/^\d+\.\s*/, "")}
          </li>
        )
      } else if (line.trim() === "") {
        return <div key={index} className="h-2" />
      } else {
        return (
          <p key={index} className="my-1">
            {line}
          </p>
        )
      }
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">会議要約</CardTitle>
        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>コピー完了</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>コピー</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="prose prose-sm max-w-none">{formatSummary()}</div>
      </CardContent>
    </Card>
  )
}
