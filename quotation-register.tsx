"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Search,
  Upload,
  Plus,
  Minus,
  X,
  Printer,
  FileText,
  Save,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronDown,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

interface QuotationData {
  id: string
  quotationNumber: string
  quotationDate: string
  customerCode: string
  customerName: string
  title: string
  staffName: string
  quotationTotal: number
  status: "draft" | "approved" | "sent" | "completed"
  createdAt: string
  updatedAt: string
  items?: Item[] // 商品明細を追加
}

export default function QuotationRegister() {
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

  // 見積検索ダイアログ用の状態管理
  const [quotationSearchDialogOpen, setQuotationSearchDialogOpen] = useState(false)
  const [quotationSearchConditions, setQuotationSearchConditions] = useState({
    quotationNumber: "",
    customerCode: "",
    customerName: "",
    staffName: "",
    dateFrom: "",
    dateTo: "",
    productName: "",
    productCode: "",
    myApprovalOnly: false,
  })
  const [quotationSearchResults, setQuotationSearchResults] = useState<QuotationData[]>([])
  const [isQuotationSearched, setIsQuotationSearched] = useState(false)

  const [currentQuotationPage, setCurrentQuotationPage] = useState(1) // 見積検索の現在のページ
  const [itemsPerPage, setItemsPerPage] = useState(50) // 1ページあたりの表示件数（デフォルト50件）

  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalType, setApprovalType] = useState<"approve" | "reject">("approve")
  const [approvalReason, setApprovalReason] = useState("")

  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // サンプル商品データ (医薬品に変更)
  const sampleProducts = [
    {
      id: "1",
      makerName: "健栄製薬",
      makerCode: "4987286307794",
      productName: "ワセリンHG",
      unit: "個",
      listPrice: "800",
      wholesalePrice: "480",
      isBestseller: true,
    },
    {
      id: "2",
      makerName: "ムンディファーマ",
      makerCode: "4987067276202",
      productName: "イソジンうがい薬",
      unit: "本",
      listPrice: "1200",
      wholesalePrice: "720",
      isBestseller: true,
    },
    {
      id: "3",
      makerName: "第一三共ヘルスケア",
      makerCode: "4987107616662",
      productName: "ロキソニンS",
      unit: "箱",
      listPrice: "750",
      wholesalePrice: "450",
      isBestseller: false,
    },
    {
      id: "4",
      makerName: "池田模範堂",
      makerCode: "4987426002652",
      productName: "ムヒアルファEX",
      unit: "個",
      listPrice: "1100",
      wholesalePrice: "660",
      isBestseller: true,
    },
    {
      id: "5",
      makerName: "第一三共ヘルスケア",
      makerCode: "4987107615467",
      productName: "新ルルAゴールドDX",
      unit: "箱",
      listPrice: "1500",
      wholesalePrice: "900",
      isBestseller: false,
    },
  ]

  // サンプル得意先データを追加
  const sampleCustomers = [
    {
      id: "1",
      customerCode: "C001",
      customerName: "株式会社山田薬局",
    },
    {
      id: "2",
      customerCode: "C002",
      customerName: "田中ドラッグストア",
    },
    {
      id: "3",
      customerCode: "C003",
      customerName: "佐藤病院",
    },
    {
      id: "4",
      customerCode: "C004",
      customerName: "鈴木クリニック",
    },
    {
      id: "5",
      customerCode: "C005",
      customerName: "高橋調剤薬局",
    },
    {
      id: "6",
      customerCode: "C006",
      customerName: "渡辺医療品販売",
    },
  ]

  // サンプル見積データ (商品明細を医薬品に変更)
  const sampleQuotations: QuotationData[] = [
    {
      id: "1",
      quotationNumber: "T250701001",
      quotationDate: "2025-07-01",
      customerCode: "C001",
      customerName: "株式会社山田薬局",
      title: "御見積書",
      staffName: "田中 太郎",
      quotationTotal: 850000,
      status: "approved",
      createdAt: "2025-07-01 09:30:00",
      updatedAt: "2025-07-01 14:20:00",
      items: [
        {
          makerName: "健栄製薬",
          makerCode: "4987286307794",
          productName: "ワセリンHG",
          quantity: "100",
          unit: "個",
          unitPrice: "500",
          amount: 50000,
          note: "保湿剤",
          internalMemo: "人気商品",
          listPrice: "800",
          wholesalePrice: "480",
          profitRate: 0,
          textRows: [],
        },
        {
          makerName: "ムンディファーマ",
          makerCode: "4987067276202",
          productName: "イソジンうがい薬",
          quantity: "50",
          unit: "本",
          unitPrice: "1000",
          amount: 50000,
          note: "うがい薬",
          internalMemo: "季節品",
          listPrice: "1200",
          wholesalePrice: "720",
          profitRate: 0,
          textRows: [],
        },
      ],
    },
    {
      id: "2",
      quotationNumber: "T250702002",
      quotationDate: "2025-07-02",
      customerCode: "C002",
      customerName: "田中ドラッグストア",
      title: "御見積書",
      staffName: "田中 太郎",
      quotationTotal: 1250000,
      status: "sent",
      createdAt: "2025-07-02 10:15:00",
      updatedAt: "2025-07-02 16:45:00",
      items: [
        {
          makerName: "第一三共ヘルスケア",
          makerCode: "4987107616662",
          productName: "ロキソニンS",
          quantity: "200",
          unit: "箱",
          unitPrice: "600",
          amount: 120000,
          note: "鎮痛剤",
          internalMemo: "常備薬",
          listPrice: "750",
          wholesalePrice: "450",
          profitRate: 0,
          textRows: [],
        },
      ],
    },
    {
      id: "3",
      quotationNumber: "T250703003",
      quotationDate: "2025-07-03",
      customerCode: "C003",
      customerName: "佐藤病院",
      title: "参考見積書",
      staffName: "田中 太郎",
      quotationTotal: 450000,
      status: "draft",
      createdAt: "2025-07-03 11:00:00",
      updatedAt: "2025-07-03 11:00:00",
      items: [], // 明細なしの例
    },
    {
      id: "4",
      quotationNumber: "T250704004",
      quotationDate: "2025-07-04",
      customerCode: "C004",
      customerName: "鈴木クリニック",
      title: "御見積書",
      staffName: "田中 太郎",
      quotationTotal: 2100000,
      status: "completed",
      createdAt: "2025-07-04 13:20:00",
      updatedAt: "2025-07-07 09:15:00",
      items: [
        {
          makerName: "池田模範堂",
          makerCode: "4987426002652",
          productName: "ムヒアルファEX",
          quantity: "150",
          unit: "個",
          unitPrice: "1000",
          amount: 150000,
          note: "虫刺され",
          internalMemo: "夏期需要",
          listPrice: "1100",
          wholesalePrice: "660",
          profitRate: 0,
          textRows: [],
        },
        {
          makerName: "第一三共ヘルスケア",
          makerCode: "4987107615467",
          productName: "新ルルAゴールドDX",
          quantity: "80",
          unit: "箱",
          unitPrice: "1400",
          amount: 112000,
          note: "風邪薬",
          internalMemo: "冬期需要",
          listPrice: "1500",
          wholesalePrice: "900",
          profitRate: 0,
          textRows: [],
        },
      ],
    },
    {
      id: "5",
      quotationNumber: "T250705005",
      quotationDate: "2025-07-05",
      customerCode: "C005",
      customerName: "高橋調剤薬局",
      title: "落札内訳書",
      staffName: "田中 太郎",
      quotationTotal: 780000,
      status: "approved",
      createdAt: "2025-07-05 14:30:00",
      updatedAt: "2025-07-05 17:10:00",
      items: [
        {
          makerName: "健栄製薬",
          makerCode: "4987286307794",
          productName: "ワセリンHG",
          quantity: "50",
          unit: "個",
          unitPrice: "550",
          amount: 27500,
          note: "大容量",
          internalMemo: "",
          listPrice: "800",
          wholesalePrice: "480",
          profitRate: 0,
          textRows: [],
        },
      ],
    },
    {
      id: "6",
      quotationNumber: "T250708006",
      quotationDate: "2025-07-08",
      customerCode: "C006",
      customerName: "渡辺医療品販売",
      title: "御見積書",
      staffName: "佐藤 花子",
      quotationTotal: 320000,
      status: "draft",
      createdAt: "2025-07-08 08:45:00",
      updatedAt: "2025-07-08 08:45:00",
      items: [],
    },
    {
      id: "7",
      quotationNumber: "T250709007",
      quotationDate: "2025-07-09",
      customerCode: "C007",
      customerName: "伊藤薬局",
      title: "参考見積書",
      staffName: "佐藤 花子",
      quotationTotal: 1580000,
      status: "sent",
      createdAt: "2025-07-09 13:20:00",
      updatedAt: "2025-07-09 15:30:00",
      items: [],
    },
    {
      id: "8",
      quotationNumber: "T250710008",
      quotationDate: "2025-07-10",
      customerCode: "C008",
      customerName: "加藤クリニック",
      title: "御見積書",
      staffName: "鈴木 一郎",
      quotationTotal: 95000,
      status: "approved",
      createdAt: "2025-07-10 10:00:00",
      updatedAt: "2025-07-10 16:20:00",
      items: [],
    },
    {
      id: "9",
      quotationNumber: "T250711009",
      quotationDate: "2025-07-11",
      customerCode: "C009",
      customerName: "小林調剤薬局",
      title: "請書",
      staffName: "鈴木 一郎",
      quotationTotal: 2850000,
      status: "completed",
      createdAt: "2025-07-11 09:15:00",
      updatedAt: "2025-07-14 11:30:00",
      items: [],
    },
    {
      id: "10",
      quotationNumber: "T250712010",
      quotationDate: "2025-07-12",
      customerCode: "C010",
      customerName: "松本ドラッグ",
      title: "御見積書",
      staffName: "田中 太郎",
      quotationTotal: 675000,
      status: "sent",
      createdAt: "2025-07-12 14:45:00",
      updatedAt: "2025-07-12 17:00:00",
      items: [],
    },
    {
      id: "11",
      quotationNumber: "T250715011",
      quotationDate: "2025-07-15",
      customerCode: "C011",
      customerName: "中村薬局",
      title: "落札内訳書",
      staffName: "佐藤 花子",
      quotationTotal: 1920000,
      status: "approved",
      createdAt: "2025-07-15 11:30:00",
      updatedAt: "2025-07-15 16:45:00",
      items: [],
    },
    {
      id: "12",
      quotationNumber: "T250716012",
      quotationDate: "2025-07-16",
      customerCode: "C012",
      customerName: "森田病院",
      title: "御見積書",
      staffName: "鈴木 一郎",
      quotationTotal: 540000,
      status: "draft",
      createdAt: "2025-07-16 08:20:00",
      updatedAt: "2025-07-16 08:20:00",
      items: [],
    },
    {
      id: "13",
      quotationNumber: "T250717013",
      quotationDate: "2025-07-17",
      customerCode: "C013",
      customerName: "青木クリニック",
      title: "参考見積書",
      staffName: "田中 太郎",
      quotationTotal: 280000,
      status: "sent",
      createdAt: "2025-07-17 15:10:00",
      updatedAt: "2025-07-17 17:25:00",
      items: [],
    },
    {
      id: "14",
      quotationNumber: "T250718014",
      quotationDate: "2025-07-18",
      customerCode: "C014",
      customerName: "石川ドラッグ",
      title: "納品書・請求書",
      staffName: "佐藤 花子",
      quotationTotal: 3200000,
      status: "completed",
      createdAt: "2025-07-18 09:00:00",
      updatedAt: "2025-07-22 14:30:00",
      items: [],
    },
    {
      id: "15",
      quotationNumber: "T250719015",
      quotationDate: "2025-07-19",
      customerCode: "C015",
      customerName: "橋本調剤薬局",
      title: "御見積書",
      staffName: "鈴木 一郎",
      quotationTotal: 1150000,
      status: "approved",
      createdAt: "2025-07-19 13:45:00",
      updatedAt: "2025-07-19 18:20:00",
      items: [],
    },
    {
      id: "16",
      quotationNumber: "T250722016",
      quotationDate: "2025-07-22",
      customerCode: "C001",
      customerName: "株式会社山田薬局",
      title: "参考見積書",
      staffName: "田中 太郎",
      quotationTotal: 420000,
      status: "draft",
      createdAt: "2025-07-22 10:30:00",
      updatedAt: "2025-07-22 10:30:00",
      items: [],
    },
    {
      id: "17",
      quotationNumber: "T250723017",
      quotationDate: "2025-07-23",
      customerCode: "C016",
      customerName: "西村ドラッグ",
      title: "御見積書",
      staffName: "佐藤 花子",
      quotationTotal: 890000,
      status: "sent",
      createdAt: "2025-07-23 11:15:00",
      updatedAt: "2025-07-23 16:40:00",
      items: [],
    },
    {
      id: "18",
      quotationNumber: "T250724018",
      quotationDate: "2025-07-24",
      customerCode: "C017",
      customerName: "長谷川病院",
      title: "落札内訳書",
      staffName: "鈴木 一郎",
      quotationTotal: 1680000,
      status: "approved",
      createdAt: "2025-07-24 14:20:00",
      updatedAt: "2025-07-24 19:15:00",
      items: [],
    },
    {
      id: "19",
      quotationNumber: "T250725019",
      quotationDate: "2025-07-25",
      customerCode: "C018",
      customerName: "藤田クリニック",
      title: "請書",
      staffName: "田中 太郎",
      quotationTotal: 2450000,
      status: "completed",
      createdAt: "2025-07-25 09:30:00",
      updatedAt: "2025-07-28 15:45:00",
      items: [],
    },
    {
      id: "20",
      quotationNumber: "T250726020",
      quotationDate: "2025-07-26",
      customerCode: "C019",
      customerName: "村上調剤薬局",
      title: "御見積書",
      staffName: "佐藤 花子",
      quotationTotal: 760000,
      status: "draft",
      createdAt: "2025-07-26 08:00:00",
      updatedAt: "2025-07-26 08:00:00",
      items: [],
    },
    {
      id: "21",
      quotationNumber: "T250729021",
      quotationDate: "2025-07-29",
      customerCode: "C020",
      customerName: "清水ドラッグ",
      title: "参考見積書",
      staffName: "鈴木 一郎",
      quotationTotal: 1320000,
      status: "sent",
      createdAt: "2025-07-29 12:30:00",
      updatedAt: "2025-07-29 17:20:00",
      items: [],
    },
    {
      id: "22",
      quotationNumber: "T250730022",
      quotationDate: "2025-07-30",
      customerCode: "C002",
      customerName: "田中ドラッグストア",
      title: "納品書・請求書",
      staffName: "田中 太郎",
      quotationTotal: 3850000,
      status: "completed",
      createdAt: "2025-07-30 10:45:00",
      updatedAt: "2025-07-31 14:30:00",
      items: [],
    },
    {
      id: "23",
      quotationNumber: "T250731023",
      quotationDate: "2025-07-31",
      customerCode: "C021",
      customerName: "岡田薬局",
      title: "御見積書",
      staffName: "佐藤 花子",
      quotationTotal: 185000,
      status: "approved",
      createdAt: "2025-07-31 15:20:00",
      updatedAt: "2025-07-31 18:45:00",
      items: [],
    },
    {
      id: "24",
      quotationNumber: "T250731024",
      quotationDate: "2025-07-31",
      customerCode: "C022",
      customerName: "安田調剤薬局",
      title: "落札内訳書",
      staffName: "鈴木 一郎",
      quotationTotal: 2180000,
      status: "sent",
      createdAt: "2025-07-31 09:15:00",
      updatedAt: "2025-07-31 16:30:00",
      items: [],
    },
    {
      id: "25",
      quotationNumber: "T250731025",
      customerCode: "C023",
      customerName: "池田ドラッグ",
      title: "御見積書",
      staffName: "田中 太郎",
      quotationTotal: 950000,
      status: "draft",
      createdAt: "2025-07-31 11:00:00",
      updatedAt: "2025-07-31 11:00:00",
      items: [],
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

  // F9キーで戻る機能を追加
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F9") {
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
    console.log("[v0] openCustomerSearch called")
    console.log("[v0] customerSearchOpen before:", customerSearchOpen)
    setCustomerSearchCondition("")
    setCustomerSearchOpen(true)
    console.log("[v0] customerSearchOpen set to true")
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
        profitRate: calculateProfitRate(product.listPrice, product.wholesalePrice), // 粗利率を再計算
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

  // 見積検索ダイアログの検索処理
  const executeQuotationSearch = () => {
    let filtered = sampleQuotations

    if (quotationSearchConditions.quotationNumber.trim()) {
      filtered = filtered.filter((q) =>
        q.quotationNumber.toLowerCase().includes(quotationSearchConditions.quotationNumber.toLowerCase()),
      )
    }
    if (quotationSearchConditions.customerCode.trim()) {
      filtered = filtered.filter((q) =>
        q.customerCode.toLowerCase().includes(quotationSearchConditions.customerCode.toLowerCase()),
      )
    }
    if (quotationSearchConditions.customerName.trim()) {
      filtered = filtered.filter((q) =>
        q.customerName.toLowerCase().includes(quotationSearchConditions.customerName.toLowerCase()),
      )
    }
    if (quotationSearchConditions.staffName.trim()) {
      filtered = filtered.filter((q) =>
        q.staffName.toLowerCase().includes(quotationSearchConditions.staffName.toLowerCase()),
      )
    }
    if (quotationSearchConditions.dateFrom) {
      filtered = filtered.filter((q) => q.quotationDate >= quotationSearchConditions.dateFrom)
    }
    if (quotationSearchConditions.dateTo) {
      filtered = filtered.filter((q) => q.quotationDate <= quotationSearchConditions.dateTo)
    }
    if (quotationSearchConditions.productName.trim()) {
      filtered = filtered.filter((q) =>
        q.items.some((item) =>
          item.productName.toLowerCase().includes(quotationSearchConditions.productName.toLowerCase()),
        ),
      )
    }
    if (quotationSearchConditions.productCode.trim()) {
      filtered = filtered.filter((q) =>
        q.items.some((item) =>
          item.makerCode.toLowerCase().includes(quotationSearchConditions.productCode.toLowerCase()),
        ),
      )
    }

    setQuotationSearchResults(filtered)
    setIsQuotationSearched(true)
    setCurrentQuotationPage(1) // 検索実行時にページをリセット
  }

  // 見積検索ダイアログのクリア処理
  const clearQuotationSearchConditions = () => {
    setQuotationSearchConditions({
      quotationNumber: "",
      customerCode: "",
      customerName: "",
      staffName: "",
      dateFrom: "",
      dateTo: "",
      productName: "",
      productCode: "",
      myApprovalOnly: false,
    })
    setQuotationSearchResults([])
    setIsQuotationSearched(false)
    setCurrentQuotationPage(1) // クリア時にページをリセット
  }

  const duplicateQuotationFromSearch = (quotation: QuotationData) => {
    const newItems = Array.from(
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
    )

    let totalAmount = 0
    if (quotation.items) {
      quotation.items.forEach((item, idx) => {
        if (idx < 20) {
          const calculatedProfitRate = calculateProfitRate(item.listPrice, item.wholesalePrice)
          newItems[idx] = { ...item, profitRate: calculatedProfitRate }
          totalAmount += item.amount
        }
      })
    }

    // 複製の場合は見積番号を空にして新規として扱う
    setFormData((prev) => ({
      ...prev,
      quotationNumber: "", // 見積番号は空にする
      quotationDate: new Date().toISOString().split("T")[0], // 今日の日付を設定
      customerCode: quotation.customerCode,
      customerName: quotation.customerName,
      title: quotation.title,
      staffName: quotation.staffName,
      quotationTotal: totalAmount,
      items: newItems,
    }))
    setVisibleRows(quotation.items ? Math.max(quotation.items.length, 1) : 1)
    setQuotationSearchDialogOpen(false)
  }

  const selectQuotationFromSearch = (quotation: QuotationData) => {
    const newItems = Array.from(
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
    )

    let totalAmount = 0
    if (quotation.items) {
      quotation.items.forEach((item, idx) => {
        if (idx < 20) {
          const calculatedProfitRate = calculateProfitRate(item.listPrice, item.wholesalePrice)
          newItems[idx] = { ...item, profitRate: calculatedProfitRate }
          totalAmount += item.amount
        }
      })
    }

    setFormData((prev) => ({
      ...prev,
      quotationNumber: quotation.quotationNumber,
      quotationDate: quotation.quotationDate,
      customerCode: quotation.customerCode,
      customerName: quotation.customerName,
      title: quotation.title,
      staffName: quotation.staffName,
      quotationTotal: totalAmount, // 合計金額も再計算
      items: newItems,
    }))
    setVisibleRows(quotation.items ? Math.max(quotation.items.length, 1) : 1) // 選択された明細数に応じて表示行数を更新
    setQuotationSearchDialogOpen(false)
  }

  // ページングの計算
  const totalPages = Math.ceil(quotationSearchResults.length / itemsPerPage)
  const startIndex = (currentQuotationPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentQuotations = quotationSearchResults.slice(startIndex, endIndex)

  const handleApprovalAction = (type: "approve" | "reject") => {
    setApprovalType(type)
    setApprovalReason("")
    setApprovalDialogOpen(true)
  }

  const submitApprovalAction = () => {
    console.log(`[v0] ${approvalType === "approve" ? "承認" : "否認"}処理:`, approvalReason)
    // 実際の登録処理はここに実装
    setApprovalDialogOpen(false)
    setApprovalReason("")
  }

  const handleRegister = () => {
    console.log("登録を実行")
    // 実際の登録処理はここに実装される
    setRegistrationSuccess(true)
  }

  return (
    <div className="max-w-full mx-auto space-y-4 px-2" style={{ backgroundColor: "#FAF5E9", minHeight: "100vh" }}>
      <div className="flex justify-start gap-1">
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
                      <th className="border border-gray-300 px-3 py-2 text-left">得意先名</th>
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

        {/* 見積検索ダイアログ */}
        <Dialog open={quotationSearchDialogOpen} onOpenChange={setQuotationSearchDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs border-gray-300 hover:bg-gray-100 bg-white text-gray-700"
              onClick={() => {
                setQuotationSearchDialogOpen(true)
                clearQuotationSearchConditions() // ダイアログを開くときに検索条件をクリア
              }}
            >
              <Search className="w-3 h-3 mr-1" />
              見積検索
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto" style={{ backgroundColor: "#FAF5E9" }}>
            <DialogHeader style={{ backgroundColor: "#FAF5E9" }}>
              <DialogTitle>見積検索</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* 検索条件 */}
              <div className="p-4 rounded" style={{ backgroundColor: "#FAF5E9" }}>
                <h4 className="text-sm font-semibold mb-2">【検索条件】</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="dialog-dateFrom" className="text-xs font-medium">
                      開始日
                    </Label>
                    <Input
                      id="dialog-dateFrom"
                      type="date"
                      value={quotationSearchConditions.dateFrom}
                      onChange={(e) => setQuotationSearchConditions((prev) => ({ ...prev, dateFrom: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dialog-dateTo" className="text-xs font-medium">
                      終了日
                    </Label>
                    <Input
                      id="dialog-dateTo"
                      type="date"
                      value={quotationSearchConditions.dateTo}
                      onChange={(e) => setQuotationSearchConditions((prev) => ({ ...prev, dateTo: e.target.value }))}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dialog-quotationNumber" className="text-xs font-medium">
                      見積番号
                    </Label>
                    <Input
                      id="dialog-quotationNumber"
                      value={quotationSearchConditions.quotationNumber}
                      onChange={(e) =>
                        setQuotationSearchConditions((prev) => ({ ...prev, quotationNumber: e.target.value }))
                      }
                      placeholder="見積番号"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dialog-customerCode" className="text-xs font-medium">
                      得意先コード
                    </Label>
                    <Input
                      id="dialog-customerCode"
                      value={quotationSearchConditions.customerCode}
                      onChange={(e) =>
                        setQuotationSearchConditions((prev) => ({ ...prev, customerCode: e.target.value }))
                      }
                      placeholder="得意先コード"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    {/* 4. 得意先名 */}
                    <div className="space-y-1">
                      <Label htmlFor="customerName" className="text-xs font-medium">
                        得意先名 <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-1">
                        <Input
                          id="customerName"
                          value={quotationSearchConditions.customerName}
                          onChange={(e) =>
                            setQuotationSearchConditions((prev) => ({ ...prev, customerName: e.target.value }))
                          }
                          placeholder="得意先名"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dialog-staffName" className="text-xs font-medium">
                      担当者名
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full h-8 justify-between text-xs font-normal bg-white"
                        >
                          {quotationSearchConditions.staffName || "担当者名を選択または入力"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="担当者名を検索..."
                            className="h-8 text-xs"
                            value={quotationSearchConditions.staffName}
                            onValueChange={(value) =>
                              setQuotationSearchConditions((prev) => ({ ...prev, staffName: value }))
                            }
                          />
                          <CommandList>
                            <CommandEmpty>該当する担当者が見つかりません。</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="田中太郎"
                                onSelect={() =>
                                  setQuotationSearchConditions((prev) => ({ ...prev, staffName: "田中太郎" }))
                                }
                              >
                                田中太郎
                              </CommandItem>
                              <CommandItem
                                value="佐藤花子"
                                onSelect={() =>
                                  setQuotationSearchConditions((prev) => ({ ...prev, staffName: "佐藤花子" }))
                                }
                              >
                                佐藤花子
                              </CommandItem>
                              <CommandItem
                                value="鈴木一郎"
                                onSelect={() =>
                                  setQuotationSearchConditions((prev) => ({ ...prev, staffName: "鈴木一郎" }))
                                }
                              >
                                鈴木一郎
                              </CommandItem>
                              <CommandItem
                                value="高橋美咲"
                                onSelect={() =>
                                  setQuotationSearchConditions((prev) => ({ ...prev, staffName: "高橋美咲" }))
                                }
                              >
                                高橋美咲
                              </CommandItem>
                              <CommandItem
                                value="山田健太"
                                onSelect={() =>
                                  setQuotationSearchConditions((prev) => ({ ...prev, staffName: "山田健太" }))
                                }
                              >
                                山田健太
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="dialog-productName" className="text-xs font-medium">
                      商品名
                    </Label>
                    <Input
                      id="dialog-productName"
                      value={quotationSearchConditions.productName}
                      onChange={(e) =>
                        setQuotationSearchConditions((prev) => ({ ...prev, productName: e.target.value }))
                      }
                      placeholder="商品名"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="dialog-productCode" className="text-xs font-medium">
                      商品コード
                    </Label>
                    <Input
                      id="dialog-productCode"
                      value={quotationSearchConditions.productCode}
                      onChange={(e) =>
                        setQuotationSearchConditions((prev) => ({ ...prev, productCode: e.target.value }))
                      }
                      placeholder="商品コード"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={quotationSearchConditions.myApprovalOnly}
                      onChange={(e) =>
                        setQuotationSearchConditions((prev) => ({ ...prev, myApprovalOnly: e.target.checked }))
                      }
                      className="w-3 h-3"
                    />
                    <span className="font-medium text-blue-700">自分の承認対象のみ</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={clearQuotationSearchConditions}
                    className="h-8 px-4 text-xs bg-white"
                  >
                    クリア
                  </Button>
                  <Button onClick={executeQuotationSearch} className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700">
                    <Search className="w-3 h-3 mr-1" />
                    検索
                  </Button>
                </div>
              </div>

              {/* 検索結果 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold">見積一覧</h4>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">表示件数:</span>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="itemsPerPage"
                        value="50"
                        checked={itemsPerPage === 50}
                        onChange={() => {
                          setItemsPerPage(50)
                          setCurrentQuotationPage(1) // ページをリセット
                        }}
                        className="w-3 h-3"
                      />
                      <span>50件</span>
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="itemsPerPage"
                        value="100"
                        checked={itemsPerPage === 100}
                        onChange={() => {
                          setItemsPerPage(100)
                          setCurrentQuotationPage(1) // ページをリセット
                        }}
                        className="w-3 h-3"
                      />
                      <span>100件</span>
                    </label>
                  </div>
                </div>
                {isQuotationSearched && quotationSearchResults.length > 0 ? (
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full border-collapse border border-gray-300 text-xs">
                      <thead className="sticky top-0" style={{ backgroundColor: "#f8f9fa" }}>
                        <tr className="text-gray-600">
                          <th className="border border-gray-300 px-2 py-2 text-left">見積番号</th>
                          <th className="border border-gray-300 px-2 py-2 text-left">得意先名</th>
                          <th className="border border-gray-300 px-2 py-2 text-left">見積日</th>
                          <th className="border border-gray-300 px-2 py-2 text-left">商品名</th>
                          <th className="border border-gray-300 px-2 py-2 text-left">商品コード</th>
                          <th className="border border-gray-300 px-2 py-2 text-right">見積金額</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">選択</th>
                          <th className="border border-gray-300 px-2 py-2 text-center">複製</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentQuotations.map((quotation) => (
                          <tr key={quotation.id} className="hover:opacity-90" style={{ backgroundColor: "#FAF5E9" }}>
                            <td className="border border-gray-300 px-2 py-1 font-mono">{quotation.quotationNumber}</td>
                            <td className="border border-gray-300 px-2 py-1">{quotation.customerName}</td>
                            <td className="border border-gray-300 px-2 py-1">{quotation.quotationDate}</td>
                            <td className="border border-gray-300 px-2 py-1">
                              {quotation.items.map((item, index) => (
                                <div key={index} className={index > 0 ? "mt-1 pt-1 border-t border-gray-200" : ""}>
                                  {item.productName}
                                </div>
                              ))}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 font-mono">
                              {quotation.items.map((item, index) => (
                                <div key={index} className={index > 0 ? "mt-1 pt-1 border-t border-gray-200" : ""}>
                                  {item.makerCode}
                                </div>
                              ))}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              ¥{quotation.quotationTotal.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              <Button
                                size="sm"
                                onClick={() => selectQuotationFromSearch(quotation)}
                                className="h-6 px-3 text-xs"
                              >
                                選択
                              </Button>
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => duplicateQuotationFromSearch(quotation)}
                                className="h-6 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                              >
                                複製
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : isQuotationSearched ? (
                  <div className="text-center py-8 text-gray-500">検索条件に一致する見積が見つかりません</div>
                ) : (
                  <div className="text-center py-8 text-gray-500">見積を検索してください</div>
                )}
                {/* ページングコントロール */}
                {isQuotationSearched && quotationSearchResults.length > 0 && (
                  <div className="flex justify-end items-center mt-4 text-xs">
                    <div className="mr-4">
                      {startIndex + 1} - {Math.min(endIndex, quotationSearchResults.length)} 件 / 全{" "}
                      {quotationSearchResults.length} 件
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuotationPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentQuotationPage === 1}
                        className="h-7 px-3 text-xs"
                      >
                        前へ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentQuotationPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentQuotationPage === totalPages || totalPages === 0}
                        className="h-7 px-3 text-xs"
                      >
                        次へ
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setQuotationSearchDialogOpen(false)}>
                  閉じる
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
                  <Label className="text-sm font-medium">メーカーコード</Label>
                  <Input
                    value={searchConditions.makerCode}
                    onChange={(e) => setSearchConditions((prev) => ({ ...prev, makerCode: e.target.value }))}
                    placeholder="メーカーコード"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">絞り込み</Label>
                  <Select
                    value={searchConditions.filterType}
                    onValueChange={(value) => setSearchConditions((prev) => ({ ...prev, filterType: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bestseller">売れ筋商品</SelectItem>
                      <SelectItem value="new">新商品</SelectItem>
                      <SelectItem value="all">全商品</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 検索ボタン */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    console.log("[v0] 商品検索実行")
                    // 実際の検索処理はここに実装
                  }}
                  className="px-8"
                >
                  検索
                </Button>
              </div>

              {/* 検索結果テーブル */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="border border-gray-300 px-2 py-1 text-left">商品コード</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">商品名</th>
                        <th className="border border-gray-300 px-2 py-1 text-left">メーカー</th>
                        <th className="border border-gray-300 px-2 py-1 text-right">単価</th>
                        <th className="border border-gray-300 px-2 py-1 text-center">選択</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* サンプルデータ */}
                      <tr className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1">P001</td>
                        <td className="border border-gray-300 px-2 py-1">サンプル商品A</td>
                        <td className="border border-gray-300 px-2 py-1">メーカーA</td>
                        <td className="border border-gray-300 px-2 py-1 text-right">¥1,000</td>
                        <td className="border border-gray-300 px-2 py-1 text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (currentSearchRow !== null) {
                                handleItemChange(currentSearchRow, "productCode", "P001")
                                handleItemChange(currentSearchRow, "productName", "サンプル商品A")
                                handleItemChange(currentSearchRow, "unitPrice", 1000)
                                setProductSearchOpen(false)
                              }
                            }}
                          >
                            選択
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
      </div>

      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="max-w-md" style={{ backgroundColor: "#FAF5E9" }}>
          <DialogHeader>
            <DialogTitle>{approvalType === "approve" ? "承認" : "否認"}理由の入力</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approvalReason" className="text-sm font-medium">
                {approvalType === "approve" ? "承認" : "否認"}理由
              </Label>
              <Textarea
                id="approvalReason"
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                placeholder={`${approvalType === "approve" ? "承認" : "否認"}理由を入力してください`}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)} className="px-4">
                キャンセル
              </Button>
              <Button
                onClick={submitApprovalAction}
                className={
                  approvalType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                }
                disabled={!approvalReason.trim()}
              >
                {approvalType === "approve" ? "承認" : "否認"}実行
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="bg-[#FAF5E9]">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">基本情報</h2>
            </div>
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
                className="h-8 text-xs"
                style={{ backgroundColor: "#f8f9fa" }}
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

            {/* 4. 得意先名 */}
            <div className="space-y-1">
              <Label htmlFor="customerName" className="text-xs font-medium">
                得意先名 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-1">
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="得意先名"
                  className="h-8 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("[v0] search button clicked")
                    openCustomerSearch()
                  }}
                  className="h-8 w-8 p-0 bg-white"
                >
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
              <Input
                id="staffName"
                value={formData.staffName}
                onChange={(e) => handleInputChange("staffName", e.target.value)}
                className="h-8 text-xs bg-white"
              />
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
                    <Button
                      variant="outline"
                      className="flex-1 h-8 text-xs bg-transparent"
                      style={{ backgroundColor: "#f8f9fa" }}
                      onClick={() => openSealDialog("staff")}
                    >
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
                        <div className="flex justify-center p-4 rounded" style={{ backgroundColor: "#FAF5E9" }}>
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
                    <Button
                      variant="outline"
                      className="flex-1 h-8 text-xs bg-transparent"
                      style={{ backgroundColor: "#f8f9fa" }}
                      onClick={() => openSealDialog("approver")}
                    >
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
                        <div className="flex justify-center p-4 rounded" style={{ backgroundColor: "#FAF5E9" }}>
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
                className="text-right h-8 text-xs font-bold"
                style={{ backgroundColor: "#f8f9fa" }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* 承認条件のブロックを削除 */}</div>
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
                  <tr style={{ backgroundColor: "#f8f9fa" }} className="text-gray-600">
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
                      <tr key={`item-${index}`} style={{ backgroundColor: "#FAF5E9" }}>
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
                          <div className="flex gap-1">
                            <Input
                              value={item.makerCode}
                              onChange={(e) => handleItemChange(index, "makerCode", e.target.value)}
                              maxLength={10}
                              className="h-6 text-xs border-0 p-1 flex-1"
                              placeholder="商品コード"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openProductSearch(index)}
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <Search className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-0.5 py-0.5">
                          <div className="flex gap-1">
                            <Input
                              value={item.productName}
                              onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                              maxLength={50}
                              className="h-6 text-xs border-0 p-1 flex-1"
                              placeholder="商品名"
                            />
                            <Button
                              type="button"
                              onClick={() => openProductSearch(index)}
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <Search className="h-3 w-3" />
                            </Button>
                          </div>
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
                        <tr key={`text-${textRow.id}`} style={{ backgroundColor: "#FAF5E9" }}>
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

            {/* 備考欄と承認状況を並列配置 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* 左側：備考欄 */}
              <Card style={{ backgroundColor: "#FAF5E9" }}>
                <CardHeader className="pb-2">
                  <h2 className="text-lg font-bold text-gray-800">備考内容</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 text-xs">
                        <thead>
                          <tr style={{ backgroundColor: "#f8f9fa" }} className="text-gray-600">
                            <th className="border border-gray-300 px-2 py-1 font-medium text-left">備考内容</th>
                            <th className="border border-gray-300 px-2 py-1 font-medium text-center w-20">文字数</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ backgroundColor: "#FAF5E9" }}>
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
                          <tr style={{ backgroundColor: "#FAF5E9" }}>
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
                          <tr style={{ backgroundColor: "#FAF5E9" }}>
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
                </CardContent>
              </Card>

              {/* 右側：承認状況 */}
              <Card style={{ backgroundColor: "#FAF5E9" }}>
                <CardHeader className="pb-2">
                  <h2 className="text-lg font-bold text-gray-800">承認状況</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">承認者</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-md text-gray-700">田中 太郎</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">承認状態</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-md">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          承認待ち
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600">承認コメント</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-md text-gray-700 min-h-[2.5rem]">
                        金額の再確認をお願いします。
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 mb-32">
        <Button
          onClick={() => handleApprovalAction("approve")}
          className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          承認
        </Button>
        <Button onClick={() => handleApprovalAction("reject")} variant="destructive" className="h-10 px-4 shadow-lg">
          <XCircle className="w-4 h-4 mr-2" />
          否認
        </Button>
        <Button
          onClick={() => console.log("引戻しを実行")}
          className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          引戻し
        </Button>
        <Button
          onClick={() => console.log("一時保存を実行")}
          className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          一時保存
        </Button>
        <Button onClick={handleRegister} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <CheckCircle className="w-4 h-4 mr-2" />
          登録
        </Button>
      </div>

      <Dialog open={registrationSuccess} onOpenChange={setRegistrationSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              登録完了
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">見積データが正常に登録されました。</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setRegistrationSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
