"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface FunctionKey {
  key: string
  label: string
  action?: () => void
  disabled?: boolean
}

interface FunctionKeyFooterProps {
  functionKeys: FunctionKey[]
}

export default function FunctionKeyFooterDetailed({ functionKeys }: FunctionKeyFooterProps) {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize("mobile")
      } else if (width < 1024) {
        setScreenSize("tablet")
      } else {
        setScreenSize("desktop")
      }
    }

    handleResize() // 初期設定
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.startsWith("F") && event.key.length <= 3) {
        const keyNumber = Number.parseInt(event.key.substring(1))
        if (keyNumber >= 1 && keyNumber <= 12) {
          event.preventDefault()
          const functionKey = functionKeys.find((fk) => fk.key === event.key)
          if (functionKey && functionKey.action && !functionKey.disabled) {
            functionKey.action()
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [functionKeys])

  const allFunctionKeys = Array.from({ length: 12 }, (_, i) => {
    const key = `F${i + 1}`
    const definedKey = functionKeys.find((fk) => fk.key === key)
    return definedKey || { key, label: "", disabled: true }
  })

  // 画面サイズに応じたグリッド列数
  const getGridCols = () => {
    switch (screenSize) {
      case "mobile":
        return "grid-cols-4" // 4列×3行
      case "tablet":
        return "grid-cols-6" // 6列×2行
      case "desktop":
        return "grid-cols-12" // 12列×1行
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 sm:px-4 py-2 z-50">
      <div className={`grid ${getGridCols()} gap-1 max-w-7xl mx-auto`}>
        {allFunctionKeys.map((fKey) => (
          <Button
            key={fKey.key}
            size="sm"
            variant="outline"
            disabled={fKey.disabled || !fKey.action}
            onClick={fKey.action}
            className={`h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap ${
              fKey.disabled || !fKey.action
                ? "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed"
                : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600 active:bg-gray-500"
            }`}
          >
            <span className="font-mono text-xs">{fKey.key}</span>
            {fKey.label && (
              <span className={`ml-1 truncate ${screenSize === "mobile" ? "hidden" : "inline"}`}>{fKey.label}</span>
            )}
          </Button>
        ))}
      </div>

      {/* デバッグ用（本番では削除） */}
      <div className="text-center text-xs text-gray-400 mt-1">
        現在の画面サイズ: {screenSize} ({window.innerWidth}px)
      </div>
    </div>
  )
}
