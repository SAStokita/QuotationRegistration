"use client"

import { Menu, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemHeaderProps {
  title: string
  onMenuClick?: () => void
}

export default function SystemHeader({ title, onMenuClick }: SystemHeaderProps) {
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const now = new Date()
    const formatted = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}(${["日", "月", "火", "水", "木", "金", "土"][now.getDay()]})`
    setCurrentDate(formatted)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F12") {
        event.preventDefault()
        // 遷移元の画面に戻る
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = "/"
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 bg-blue-600 text-white px-4 py-3 z-50"
      style={{ backgroundColor: "#3b82f6" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="p-2 text-white hover:text-blue-200 hover:bg-blue-700 rounded">
            <Menu size={20} />
          </button>
          <div
            className="text-sm text-blue-200 cursor-pointer hover:text-white"
            onClick={() => {
              // F12キーと同じ動作：遷移元の画面に戻る
              if (window.history.length > 1) {
                window.history.back()
              } else {
                window.location.href = "/"
              }
            }}
          >
            {title}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-blue-200">{currentDate}</span>
          <div className="flex items-center space-x-2 text-sm text-white">
            <User size={16} />
            <span>田中太郎</span>
          </div>
          <button className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-200 hover:text-red-300 hover:bg-blue-700 rounded">
            <LogOut size={16} />
            <span>ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  )
}
