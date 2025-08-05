"use client"

import FunctionKeyFooter from "./function-key-footer"
import SystemHeader from "./system-header"
import QuotationRegister from "./quotation-register"
import { useState } from "react"

export default function QuotationRegisterLayout() {
  const [sidebarPinned, setSidebarPinned] = useState(false)

  const toggleSidebar = () => {
    setSidebarPinned(!sidebarPinned)
    console.log("サイドバーをトグル")
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF5E9" }}>
      {/* ヘッダー */}
      <SystemHeader title="見積登録" onMenuClick={toggleSidebar} />

      {/* メインコンテンツエリア */}
      <main className="flex-1 p-4 pt-20 pb-20" style={{ backgroundColor: "#FAF5E9" }}>
        <QuotationRegister />
      </main>

      {/* フッター（ファンクションキー） */}
      <FunctionKeyFooter
        functionKeys={[
          {
            key: "F1",
            label: "ヘルプ",
            action: () => console.log("ヘルプを表示"),
          },
          {
            key: "F3",
            label: "検索",
            action: () => console.log("検索を実行"),
          },
          {
            key: "F4",
            label: "クリア",
            action: () => console.log("クリアを実行"),
          },
          {
            key: "F6",
            label: "登録", // ここを修正
            action: () => {
              // 検索画面への遷移処理
              window.location.href = "/"
            },
          },
          {
            key: "F9",
            label: "戻る",
            action: () => console.log("戻る"),
          },
          {
            key: "F12",
            label: "終了",
            action: () => console.log("終了"),
          },
        ]}
      />
    </div>
  )
}
