"use client"
import { useEffect } from "react"

interface FunctionKey {
  key: string
  label: string
  action?: () => void
  disabled?: boolean
}

interface FunctionKeyFooterProps {
  functionKeys: FunctionKey[]
}

export default function FunctionKeyFooter({ functionKeys }: FunctionKeyFooterProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F1~F12キーの処理
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
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [functionKeys])

  // F1~F12の全てのキーを表示（未使用はグレーアウト）
  const allFunctionKeys = Array.from({ length: 12 }, (_, i) => {
    const key = `F${i + 1}`
    const definedKey = functionKeys.find((fk) => fk.key === key)
    return definedKey || { key, label: "", disabled: true }
  })

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-2 sm:px-4 py-2 z-50"
      style={{ backgroundColor: "#4a5568" }}
    >
      <div className="grid grid-cols-6 md:grid-cols-12 gap-1 max-w-7xl mx-auto">
        {allFunctionKeys.map((fKey) => (
          <div
            key={fKey.key}
            className={`h-8 sm:h-9 text-xs sm:text-sm whitespace-nowrap flex items-center justify-center px-2 rounded ${
              fKey.disabled || !fKey.action
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500 cursor-pointer"
            }`}
            onClick={fKey.action}
          >
            <span className="font-mono text-xs mr-1">{fKey.key}</span>
            {fKey.label && <span className="hidden sm:inline truncate text-xs">{fKey.label}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
