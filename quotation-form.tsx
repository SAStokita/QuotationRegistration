"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Upload, Plus, Minus, X, Printer, FileText, Save, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TextRow {
  id: string
  text: string
}

interface Item {
  makerName: string
  makerCode: string
  productName: string
  quantity: string
  unit: string
  unitPrice: string
  amount: number
  note: string
  internalMemo: string
  listPrice: string
  wholesalePrice: string
  profitRate: number
  textRows: TextRow[]
}

export default function QuotationForm() {
  const [formData, setFormData] = useState({
    title: "",
    quotationNumber: "",
    quotationDate: "",
    customerCode: "",
    customerName: "",
    honorific: "",
    deliveryLocation: "ご指定場所",
    paymentMethod: "規定条件通り",
    deliveryDate: "",
    validityPeriod: "1カ月",
    staffName: "田中 太郎",
    quotationTotal: 0,
    taxType: "tax_excluded",
    items: Array.from(
      { length: 20 },
      (): Item => ({
        makerName: "",
        makerCode: "",
        productName: "",
        quantity: "",
        unit: "",
        unitPrice: "",
        amount: 0,
        note: "",
        internalMemo: "",
        listPrice: "",
        wholesalePrice: "",
        profitRate: 0,
        textRows: [],
      }),
    ),
    remarks1: "",
    remarks2: "",
    remarks3: "",
  })

  // 印鑑データの状態管理
  const [staffSeal, setStaffSeal] = useState<{
    name: string
    date: string
    department: string
  } | null>(null)

  const [approverSeal, setApproverSeal] = useState<{
    name: string
    date: string
    department: string
  } | null>(null)

  const [sealDialogOpen, setSealDialogOpen] = useState<{
    type: "staff" | "approver" | null
    open: boolean
  }>({ type: null, open: false })

  const [tempSealData, setTempSealData] = useState({
    name: "",
    date: "",
    department: "",
  })

  // 表示する明細行数を管理
  const [visibleRows, setVisibleRows] = useState(1)

  // 商品検索用の状態管理
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [currentSearchRow, setCurrentSearchRow] = useState<number | null>(null)
  const [searchConditions, setSearchConditions] = useState({
    productName: "",
    makerCode: "",
    filterType: "bestseller" as "bestseller" | "all",
  })

  // 得意先検索用の状態管理を追加
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [customerSearchCondition, setCustomerSearchCondition] = useState("")

  // サンプル商品データ
  const sampleProducts = [
    {
      id: "1",
      makerName: "パナソニック",
      makerCode: "WTP50001WP",
      productName: "コスモシリーズワイド21 埋込スイッチB（片切）",
      unit: "個",
      listPrice: "580",
      wholesalePrice: "348",
      isBestseller: true,
    },
    {
      id: "2",
      makerName: "パナソニック",
      makerCode: "WTP50011WP",
      productName: "コスモシリーズワイド21 埋込スイッチB（3路）",
      unit: "個",
      listPrice: "780",
      wholesalePrice: "468",
      isBestseller: true,
    },
    {
      id: "3",
      makerName: "東芝",
      makerCode: "LEKT207323N-LS9",
      productName: "LEDベースライト TENQOOシリーズ 20タイプ",
      unit: "台",
      listPrice: "12800",
      wholesalePrice: "7680",
      isBestseller: false,
    },
    {
      id: "4",
      makerName: "三菱電機",
      makerCode: "MY-B425333/N AHTN",
      productName: "LEDライトユニット形ベースライト Myシリーズ",
      unit: "台",
      listPrice: "15600",
      wholesalePrice: "9360",
      isBestseller: true,
    },
    {
      id: "5",
      makerName: "パナソニック",
      makerCode: "WTP50021WP",
      productName: "コスモシリーズワイド21 埋込スイッチB（ほたる）",
      unit: "個",
      listPrice: "980",
      wholesalePrice: "588",
      isBestseller: false,
    },
  ]

  // サンプル得意先データを追加
  const sampleCustomers = [
    {
      id: "1",
      customerCode: "C001",
      customerName: "株式会社山田電機",
    },
    {
      id: "2",
      customerCode: "C002",
      customerName: "田中建設株式会社",
    },
    {
      id: "3",
      customerCode: "C003",
      customerName: "佐藤工業有限会社",
    },
    {
      id: "4",
      customerCode: "C004",
      customerName: "鈴木電設工業株式会社",
    },
    {
      id: "5",
      customerCode: "C005",
      customerName: "高橋商事株式会社",
    },
    {
      id: "6",
      customerCode: "C006",
      customerName: "渡辺電機工業株式会社",
    },
  ]

  // 見積番号の自動生成
  const generateQuotationNumber = () => {
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `T${year}${month}${day}${random}`
  }

  // 初期化
  useEffect(() => {
    const today = new Date()
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    setFormData((prev) => ({
      ...prev,
      quotationDate: formattedDate,
      quotationNumber: generateQuotationNumber(),
    }))
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // 印刷・PDFボタンの活性化判定
  const isPrintEnabled = () => {
    if (formData.quotationTotal < 1000000) {
      // 100万円未満の場合、担当者印のみで活性化
      return staffSeal !== null
    } else {
      // 100万円以上の場合、担当者印と承認者印両方が必要
      return staffSeal !== null && approverSeal !== null
    }
  }

  // 得意先検索を開く
  const openCustomerSearch = () => {
    setCustomerSearchCondition("")
    setCustomerSearchOpen(true)
  }

  // 得意先検索結果をフィルタリング
  const getFilteredCustomers = () => {
    if (!customerSearchCondition.trim()) {
      return sampleCustomers
    }
    return sampleCustomers.filter((customer) =>
      customer.customerCode.toLowerCase().includes(customerSearchCondition.toLowerCase()),
    )
  }

  const selectCustomer = (customer: (typeof sampleCustomers)[0]) => {
    setFormData((prev) => ({
      ...prev,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
    }))
    setCustomerSearchOpen(false)
  }

  // 粗利率を計算
  const calculateProfitRate = (listPrice: string, wholesalePrice: string): number => {
    const list = Number.parseFloat(listPrice) || 0
    const wholesale = Number.parseFloat(wholesalePrice) || 0
    if (list === 0) return 0
    return ((list - wholesale) / list) * 100
  }

  // 商品検索を開く
  const openProductSearch = (rowIndex: number) => {
    setCurrentSearchRow(rowIndex)
    setSearchConditions({
      productName: "",
      makerCode: "",
      filterType: "bestseller",
    })
    setProductSearchOpen(true)
  }

  // 商品検索結果をフィルタリング
  const getFilteredProducts = () => {
    let filtered = sampleProducts

    // 売れ筋フィルター
    if (searchConditions.filterType === "bestseller") {
      filtered = filtered.filter((product) => product.isBestseller)
    }

    // 商品名での部分一致検索
    if (searchConditions.productName.trim()) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(searchConditions.productName.toLowerCase()),
      )
    }

    // メーカー商品コードでの完全一致検索
    if (searchConditions.makerCode.trim()) {
      filtered = filtered.filter((product) => product.makerCode === searchConditions.makerCode)
    }

    return filtered
  }

  // 商品を選択
  const selectProduct = (product: (typeof sampleProducts)[0]) => {
    if (currentSearchRow !== null) {
      const newItems = [...formData.items]
      newItems[currentSearchRow] = {
        ...newItems[currentSearchRow],
        makerName: product.makerName,
        makerCode: product.makerCode,
        productName: product.productName,
        unit: product.unit,
        listPrice: product.listPrice,
        wholesalePrice: product.wholesalePrice,
        profitRate: calculateProfitRate(product.listPrice, product.wholesalePrice),
      }

      setFormData((prev) => ({
        ...prev,
        items: newItems,
      }))
    }
    setProductSearchOpen(false)
    setCurrentSearchRow(null)
  }

  // 明細行の値更新
  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }

    // 数量と単価が入力されている場合、金額を自動計算
    if (field === "quantity" || field === "unitPrice") {
      const quantity = Number.parseFloat(field === "quantity" ? value : newItems[index].quantity) || 0
      const unitPrice = Number.parseFloat(field === "unitPrice" ? value : newItems[index].unitPrice) || 0
      newItems[index].amount = quantity * unitPrice
    }

    // 定価または仕切価が変更された場合、粗利率を自動計算
    if (field === "listPrice" || field === "wholesalePrice") {
      const listPrice = field === "listPrice" ? value : newItems[index].listPrice
      const wholesalePrice = field === "wholesalePrice" ? value : newItems[index].wholesalePrice
      newItems[index].profitRate = calculateProfitRate(listPrice, wholesalePrice)
    }

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      quotationTotal: newItems.reduce((sum, item) => sum + item.amount, 0),
    }))
  }

  // 行をクリア
  const clearRow = (index: number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      makerName: "",
      makerCode: "",
      productName: "",
      quantity: "",
      unit: "",
      unitPrice: "",
      amount: 0,
      note: "",
      internalMemo: "",
      listPrice: "",
      wholesalePrice: "",
      profitRate: 0,
      textRows: [],
    }
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      quotationTotal: newItems.reduce((sum, item) => sum + item.amount, 0),
    }))
  }

  // 行を追加
  const addRow = () => {
    if (visibleRows < 20) {
      setVisibleRows(visibleRows + 1)
    }
  }

  // 行を削除
  const removeRow = (index: number) => {
    if (visibleRows > 1) {
      // 削除する行をクリア
      clearRow(index)
      // 削除する行より後の行を前に詰める
      const newItems = [...formData.items]
      for (let i = index; i < visibleRows - 1; i++) {
        newItems[i] = { ...newItems[i + 1] }
      }
      // 最後の行をクリア
      newItems[visibleRows - 1] = {
        makerName: "",
        makerCode: "",
        productName: "",
        quantity: "",
        unit: "",
        unitPrice: "",
        amount: 0,
        note: "",
        internalMemo: "",
        listPrice: "",
        wholesalePrice: "",
        profitRate: 0,
        textRows: [],
      }
      setFormData((prev) => ({
        ...prev,
        items: newItems,
        quotationTotal: newItems.reduce((sum, item) => sum + item.amount, 0),
      }))
      setVisibleRows(visibleRows - 1)
    }
  }

  // テキスト行を追加
  const addTextRow = (itemIndex: number) => {
    const newItems = [...formData.items]
    const newTextRow: TextRow = {
      id: `text_${Date.now()}_${Math.random()}`,
      text: "",
    }
    newItems[itemIndex].textRows.push(newTextRow)
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  // テキスト行を削除
  const removeTextRow = (itemIndex: number, textRowId: string) => {
    const newItems = [...formData.items]
    newItems[itemIndex].textRows = newItems[itemIndex].textRows.filter((row) => row.id !== textRowId)
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  // テキスト行の内容を更新
  const handleTextRowChange = (itemIndex: number, textRowId: string, value: string) => {
    const newItems = [...formData.items]
    const textRow = newItems[itemIndex].textRows.find((row) => row.id === textRowId)
    if (textRow) {
      textRow.text = value
    }
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }))
  }

  // 印鑑ダイアログを開く
  const openSealDialog = (type: "staff" | "approver") => {
    const today = new Date().toISOString().split("T")[0]
    const currentSeal = type === "staff" ? staffSeal : approverSeal

    setTempSealData({
      name: currentSeal?.name || formData.staffName,
      date: currentSeal?.date || today,
      department: currentSeal?.department || "営業部",
    })
    setSealDialogOpen({ type, open: true })
  }

  // 印鑑を保存
  const saveSeal = () => {
    if (sealDialogOpen.type === "staff") {
      setStaffSeal({ ...tempSealData })
    } else if (sealDialogOpen.type === "approver") {
      setApproverSeal({ ...tempSealData })
    }
    setSealDialogOpen({ type: null, open: false })
  }

  // 印鑑をクリア
  const clearSeal = (type: "staff" | "approver") => {
    if (type === "staff") {
      setStaffSeal(null)
    } else {
      setApproverSeal(null)
    }
  }

  // 印鑑コンポーネント
  const SealPreview = ({ sealData }: { sealData: { name: string; date: string; department: string } }) => (
    <div className="w-16 h-16 border-2 border-red-600 rounded-full bg-red-50 flex flex-col items-center justify-center text-xs text-red-800 font-bold relative">
      <div className="text-[8px] leading-tight text-center">
        <div>{sealData.department}</div>
        <div className="text-[10px] font-black">{sealData.name}</div>
        <div className="text-[7px]">{sealData.date.replace(/-/g, ".")}</div>
      </div>
    </div>
  )

  return (
    <div className="max-w-full mx-auto space-y-4 px-2">
      <Card>
        {/* アクションボタン */}
        <CardHeader className="pb-4 flex flex-row items-center justify-end">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              disabled={!isPrintEnabled()}
              className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="w-3 h-3 mr-1" />
              印刷
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // PDF保存の実装（ここでは仮の処理）
                console.log("PDF保存を実行")
              }}
              disabled={!isPrintEnabled()}
              className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-3 h-3 mr-1" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("一時保存を実行")}
              className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-50"
            >
              <Save className="w-3 h-3 mr-1" />
              登録（一時保存）
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("コピー＆編集を実行")}
              className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-50"
            >
              <Copy className="w-3 h-3 mr-1" />
              コピー＆編集
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本情報・得意先情報・取引条件を1行に配置 */}
          <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {/* 1. タイトル */}
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-medium">
                タイトル <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.title} onValueChange={(value) => handleInputChange("title", value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quotation">御見積書</SelectItem>
                  <SelectItem value="winning_bid">落札内訳書</SelectItem>
                  <SelectItem value="reference">参考見積書</SelectItem>
                  <SelectItem value="contract">請書</SelectItem>
                  <SelectItem value="delivery_invoice">納品書・請求書</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. 見積番号 */}
            <div className="space-y-1">
              <Label htmlFor="quotationNumber" className="text-xs font-medium">
                見積番号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quotationNumber"
                value={formData.quotationNumber}
                onChange={(e) => handleInputChange("quotationNumber", e.target.value)}
                maxLength={10}
                className="bg-gray-50 h-8 text-xs"
                readOnly
              />
            </div>

            {/* 3. 見積日 */}
            <div className="space-y-1">
              <Label htmlFor="quotationDate" className="text-xs font-medium">
                見積日 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quotationDate"
                type="date"
                value={formData.quotationDate}
                onChange={(e) => handleInputChange("quotationDate", e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* 4. 宛名 */}
            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-xs font-medium">
                宛名 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1">
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  onClick={() => {
                    if (!formData.customerName.trim()) {
                      openCustomerSearch()
                    }
                  }}
                  placeholder="宛名"
                  className="h-8 text-xs cursor-pointer"
                  readOnly={!formData.customerName.trim()}
                />
                <Button variant="outline" size="sm" onClick={openCustomerSearch} className="h-8 w-8 p-0">
                  <Search className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* 5. 敬称 */}
            <div className="space-y-1">
              <Label htmlFor="honorific" className="text-xs font-medium">
                敬称
              </Label>
              <Select value={formData.honorific} onValueChange={(value) => handleInputChange("honorific", value)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onchu">御中</SelectItem>
                  <SelectItem value="sama">様</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 6. 納品場所 */}
            <div className="space-y-1">
              <Label htmlFor="deliveryLocation" className="text-xs font-medium">
                納品場所
              </Label>
              <Input
                id="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={(e) => handleInputChange("deliveryLocation", e.target.value)}
                maxLength={15}
                className="h-8 text-xs"
              />
            </div>

            {/* 7. 取引方法 */}
            <div className="space-y-1">
              <Label htmlFor="paymentMethod" className="text-xs font-medium">
                取引方法
              </Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                maxLength={15}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* 第2行：納期、有効期限、担当者情報、合計 */}
          <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {/* 8. 納期 */}
            <div className="space-y-1">
              <Label htmlFor="deliveryDate" className="text-xs font-medium">
                納期
              </Label>
              <Input
                id="deliveryDate"
                value={formData.deliveryDate}
                onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                maxLength={15}
                className="h-8 text-xs"
              />
            </div>

            {/* 9. 見積有効期限 */}
            <div className="space-y-1">
              <Label htmlFor="validityPeriod" className="text-xs font-medium">
                有効期限
              </Label>
              <Input
                id="validityPeriod"
                value={formData.validityPeriod}
                onChange={(e) => handleInputChange("validityPeriod", e.target.value)}
                maxLength={5}
                className="h-8 text-xs"
              />
            </div>

            {/* 10. 見積担当者名 */}
            <div className="space-y-1">
              <Label htmlFor="staffName" className="text-xs font-medium">
                担当者名 <span className="text-red-500">*</span>
              </Label>
              <Input id="staffName" value={formData.staffName} className="bg-gray-50 h-8 text-xs" readOnly />
            </div>

            {/* 11. 担当者印 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">担当者印</Label>
              <div className="flex gap-1">
                <Dialog
                  open={sealDialogOpen.open && sealDialogOpen.type === "staff"}
                  onOpenChange={(open) => setSealDialogOpen({ type: open ? "staff" : null, open })}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 h-8 text-xs" onClick={() => openSealDialog("staff")}>
                      {staffSeal ? (
                        <SealPreview sealData={staffSeal} />
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          印鑑
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>担当者印の作成</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="staff-name" className="text-sm font-medium">
                          氏名
                        </Label>
                        <Input
                          id="staff-name"
                          value={tempSealData.name}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="氏名を入力"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staff-date" className="text-sm font-medium">
                          日付
                        </Label>
                        <Input
                          id="staff-date"
                          type="date"
                          value={tempSealData.date}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, date: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="staff-department" className="text-sm font-medium">
                          所属
                        </Label>
                        <Input
                          id="staff-department"
                          value={tempSealData.department}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, department: e.target.value }))}
                          placeholder="所属を入力"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">プレビュー</Label>
                        <div className="flex justify-center p-4 bg-gray-50 rounded">
                          <SealPreview sealData={tempSealData} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setSealDialogOpen({ type: null, open: false })}>
                          キャンセル
                        </Button>
                        <Button onClick={saveSeal}>保存</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {staffSeal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSeal("staff")}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title="印鑑をクリア"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* 12. 承認者印 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                承認者印 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1">
                <Dialog
                  open={sealDialogOpen.open && sealDialogOpen.type === "approver"}
                  onOpenChange={(open) => setSealDialogOpen({ type: open ? "approver" : null, open })}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 h-8 text-xs" onClick={() => openSealDialog("approver")}>
                      {approverSeal ? (
                        <SealPreview sealData={approverSeal} />
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          承認印
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>承認者印の作成</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="approver-name" className="text-sm font-medium">
                          氏名
                        </Label>
                        <Input
                          id="approver-name"
                          value={tempSealData.name}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="氏名を入力"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approver-date" className="text-sm font-medium">
                          日付
                        </Label>
                        <Input
                          id="approver-date"
                          type="date"
                          value={tempSealData.date}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, date: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approver-department" className="text-sm font-medium">
                          所属
                        </Label>
                        <Input
                          id="approver-department"
                          value={tempSealData.department}
                          onChange={(e) => setTempSealData((prev) => ({ ...prev, department: e.target.value }))}
                          placeholder="所属を入力"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">プレビュー</Label>
                        <div className="flex justify-center p-4 bg-gray-50 rounded">
                          <SealPreview sealData={tempSealData} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setSealDialogOpen({ type: null, open: false })}>
                          キャンセル
                        </Button>
                        <Button onClick={saveSeal}>保存</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {approverSeal && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearSeal("approver")}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title="印鑑をクリア"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* 13. 見積合計 */}
            <div className="space-y-1">
              <Label htmlFor="quotationTotal" className="text-xs font-medium">
                見積合計 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quotationTotal"
                value={formData.quotationTotal.toLocaleString()}
                className="bg-gray-50 text-right h-8 text-xs font-bold"
                readOnly
              />
            </div>

            {/* 14. 見積区分 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                見積区分 <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.taxType}
                onValueChange={(value) => handleInputChange("taxType", value)}
                className="flex gap-3 mt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="tax_excluded" id="tax_excluded" className="w-3 h-3" />
                  <Label htmlFor="tax_excluded" className="text-xs">
                    税抜
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="tax_included" id="tax_included" className="w-3 h-3" />
                  <Label htmlFor="tax_included" className="text-xs">
                    税込
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 承認フロー情報 */}
            <div className="bg-blue-50 p-2 rounded text-xs">
              <div className="font-medium text-blue-800 mb-1">承認条件</div>
              <div className="text-blue-700 space-y-0.5">
                <div>20万円以上：担当承認</div>
                <div>100万円以上：管理者承認</div>
                <div>利益率10％未満：特別承認</div>
              </div>
            </div>
          </div>

          {/* 商品明細セクション */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">商品明細</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">{visibleRows}/20行表示</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRow}
                  disabled={visibleRows >= 20}
                  className="h-7 px-2 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  行追加
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs table-fixed">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      メーカー名
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "120px" }}>
                      メーカー商品コード
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "200px" }}>
                      商品名
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "60px" }}>
                      数量
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "60px" }}>
                      単位
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      単価
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      金額
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      摘要
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "100px" }}>
                      社内メモ
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      定価
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      仕切価
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "60px" }}>
                      粗利率
                    </th>
                    <th className="border border-gray-300 px-1 py-1 font-medium text-center" style={{ width: "80px" }}>
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.slice(0, visibleRows).map((item, index) => (
                    <>
                      {/* 商品明細行 */}
                      <tr key={`item-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.makerName}
                            onChange={(e) => handleItemChange(index, "makerName", e.target.value)}
                            maxLength={8}
                            className="h-6 text-xs border-0 p-1"
                            placeholder="メーカー"
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.makerCode}
                            onChange={(e) => handleItemChange(index, "makerCode", e.target.value)}
                            onClick={() => {
                              if (!item.makerCode.trim()) {
                                openProductSearch(index)
                              }
                            }}
                            maxLength={10}
                            className="h-6 text-xs border-0 p-1 cursor-pointer"
                            placeholder="商品コード"
                            readOnly={!item.makerCode.trim()}
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.productName}
                            onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                            onClick={() => {
                              if (!item.productName.trim()) {
                                openProductSearch(index)
                              }
                            }}
                            maxLength={50}
                            className="h-6 text-xs border-0 p-1 cursor-pointer"
                            placeholder="商品名"
                            readOnly={!item.productName.trim()}
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            type="number"
                            max={99999}
                            className="h-6 text-xs border-0 p-1 text-right"
                            placeholder="数量"
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Select value={item.unit} onValueChange={(value) => handleItemChange(index, "unit", value)}>
                            <SelectTrigger className="h-6 text-xs border-0 p-1">
                              <SelectValue placeholder="単位" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="個">個</SelectItem>
                              <SelectItem value="台">台</SelectItem>
                              <SelectItem value="本">本</SelectItem>
                              <SelectItem value="枚">枚</SelectItem>
                              <SelectItem value="セット">セット</SelectItem>
                              <SelectItem value="式">式</SelectItem>
                              <SelectItem value="m">m</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                            type="number"
                            max={9999999999}
                            className="h-6 text-xs border-0 p-1 text-right"
                            placeholder="単価"
                          />
                        </td>
                        <td className="border border-gray-300 px-1 py-0.5 text-right font-medium">
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.note}
                            onChange={(e) => handleItemChange(index, "note", e.target.value)}
                            maxLength={15}
                            className="h-6 text-xs border-0 p-1"
                            placeholder="摘要"
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.internalMemo}
                            onChange={(e) => handleItemChange(index, "internalMemo", e.target.value)}
                            maxLength={15}
                            className="h-6 text-xs border-0 p-1"
                            placeholder="社内メモ"
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.listPrice}
                            onChange={(e) => handleItemChange(index, "listPrice", e.target.value)}
                            type="number"
                            max={9999999999}
                            className="h-6 text-xs border-0 p-1 text-right"
                            placeholder="定価"
                          />
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <Input
                            value={item.wholesalePrice}
                            onChange={(e) => handleItemChange(index, "wholesalePrice", e.target.value)}
                            type="number"
                            max={9999999999}
                            className="h-6 text-xs border-0 p-1 text-right"
                            placeholder="仕切価"
                          />
                        </td>
                        <td className="border border-gray-300 px-1 py-0.5 text-right font-medium">
                          {item.profitRate > 0 ? `${item.profitRate.toFixed(1)}%` : "-"}
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5 text-center">
                          <div className="flex gap-0.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addTextRow(index)}
                              className="h-5 w-6 text-xs p-0"
                              title="テキスト行追加"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => clearRow(index)}
                              className="h-5 w-6 text-xs p-0"
                              title="クリア"
                            >
                              C
                            </Button>
                            {visibleRows > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeRow(index)}
                                className="h-5 w-6 text-xs p-0 text-red-600 hover:text-red-700"
                                title="削除"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* テキスト行 */}
                      {item.textRows.map((textRow) => (
                        <tr key={`text-${textRow.id}`} className="bg-yellow-50">
                          <td className="border border-gray-300 px-0.5 py-0.5" colSpan={12}>
                            <Input
                              value={textRow.text}
                              onChange={(e) => handleTextRowChange(index, textRow.id, e.target.value)}
                              className="h-6 text-xs border-0 p-1 bg-transparent w-full"
                              placeholder="自由入力テキスト"
                            />
                          </td>
                          <td className="border border-gray-300 px-0.5 py-0.5 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeTextRow(index, textRow.id)}
                              className="h-5 w-6 text-xs p-0 text-red-600 hover:text-red-700"
                              title="テキスト行削除"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 備考欄 */}
            <div className="space-y-2 mt-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-1 font-medium text-left">備考内容</th>
                      <th className="border border-gray-300 px-2 py-1 font-medium text-center w-20">文字数</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-0.5 py-0.5">
                        <Input
                          value={formData.remarks1}
                          onChange={(e) => handleInputChange("remarks1", e.target.value)}
                          maxLength={70}
                          className="h-8 text-xs border-0 p-2 w-full"
                          placeholder="備考1行目（70文字まで）"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">
                        {formData.remarks1.length}/70
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-0.5 py-0.5">
                        <Input
                          value={formData.remarks2}
                          onChange={(e) => handleInputChange("remarks2", e.target.value)}
                          maxLength={70}
                          className="h-8 text-xs border-0 p-2 w-full"
                          placeholder="備考2行目（70文字まで）"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">
                        {formData.remarks2.length}/70
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="border border-gray-300 px-0.5 py-0.5">
                        <Input
                          value={formData.remarks3}
                          onChange={(e) => handleInputChange("remarks3", e.target.value)}
                          maxLength={70}
                          className="h-8 text-xs border-0 p-2 w-full"
                          placeholder="備考3行目（70文字まで）"
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-center text-gray-500">
                        {formData.remarks3.length}/70
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>

        {/* 得意先検索ダイアログ */}
        <Dialog open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>得意先検索</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 検索条件 */}
              <div className="p-4 bg-gray-50 rounded">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">得意先コード</Label>
                  <Input
                    value={customerSearchCondition}
                    onChange={(e) => setCustomerSearchCondition(e.target.value)}
                    placeholder="得意先コードを入力"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* 検索結果 */}
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left">得意先コード</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">宛名</th>
                      <th className="border border-gray-300 px-3 py-2 text-center">選択</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCustomers().map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 font-mono">{customer.customerCode}</td>
                        <td className="border border-gray-300 px-3 py-2">{customer.customerName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <Button size="sm" onClick={() => selectCustomer(customer)} className="h-7 px-3 text-xs">
                            選択
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredCustomers().length === 0 && (
                  <div className="text-center py-8 text-gray-500">検索条件に一致する得意先が見つかりません</div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCustomerSearchOpen(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 商品検索ダイアログ */}
        <Dialog open={productSearchOpen} onOpenChange={setProductSearchOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>商品検索</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 検索条件 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">商品名（部分一致）</Label>
                  <Input
                    value={searchConditions.productName}
                    onChange={(e) => setSearchConditions((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="商品名を入力"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">メーカー商品コード（完全一致）</Label>
                  <Input
                    value={searchConditions.makerCode}
                    onChange={(e) => setSearchConditions((prev) => ({ ...prev, makerCode: e.target.value }))}
                    placeholder="商品コードを入力"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">表示条件</Label>
                  <RadioGroup
                    value={searchConditions.filterType}
                    onValueChange={(value) =>
                      setSearchConditions((prev) => ({ ...prev, filterType: value as "bestseller" | "all" }))
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bestseller" id="bestseller" />
                      <Label htmlFor="bestseller" className="text-sm">
                        売れ筋
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all" className="text-sm">
                        すべて
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* 検索結果 */}
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-2 py-2 text-left">メーカー名</th>
                      <th className="border border-gray-300 px-2 py-2 text-left">商品コード</th>
                      <th className="border border-gray-300 px-2 py-2 text-left">商品名</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">単位</th>
                      <th className="border border-gray-300 px-2 py-2 text-right">定価</th>
                      <th className="border border-gray-300 px-2 py-2 text-right">仕切価</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">売れ筋</th>
                      <th className="border border-gray-300 px-2 py-2 text-center">選択</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredProducts().map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-2">{product.makerName}</td>
                        <td className="border border-gray-300 px-2 py-2 font-mono text-xs">{product.makerCode}</td>
                        <td className="border border-gray-300 px-2 py-2">{product.productName}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{product.unit}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">
                          ¥{Number(product.listPrice).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-right">
                          ¥{Number(product.wholesalePrice).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          {product.isBestseller ? (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">売れ筋</span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-2 text-center">
                          <Button size="sm" onClick={() => selectProduct(product)} className="h-7 px-3 text-xs">
                            選択
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredProducts().length === 0 && (
                  <div className="text-center py-8 text-gray-500">検索条件に一致する商品が見つかりません</div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProductSearchOpen(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}
