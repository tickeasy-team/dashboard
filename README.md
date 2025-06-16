# Tickeasy Dashboard - 演唱會售票後台管理系統

## 📖 項目簡介

Tickeasy Dashboard 是一個功能完整的演唱會售票網站後台管理系統，提供演唱會審核、用戶管理、訂單管理等核心功能。系統採用現代化的技術棧構建，提供直觀易用的管理界面。

## ✨ 主要功能

### 🎵 演唱會管理
- **演唱會列表**：查看所有演唱會資訊
- **演唱會詳情**：包含基本資訊、主辦單位、場地資訊
- **狀態管理**：草稿、審核中、已發布、已拒絕、已完成
- **人工審核**：支援審核操作和備註功能
- **審核歷史**：完整的審核記錄追蹤

### 👥 用戶管理
- **用戶列表**：查看所有註冊用戶
- **角色管理**：一般用戶、管理員、超級管理員
- **權限控制**：基於角色的訪問控制

### 📋 訂單管理
- **訂單追蹤**：保留中、已過期、已付款、已取消、已退款
- **訂單詳情**：購買人資訊、票券資訊、發票資訊
- **統計分析**：訂單狀態統計

### 📊 儀表板
- **數據概覽**：用戶數、演唱會數、訂單數統計
- **待處理項目**：需要審核的演唱會數量
- **快速導航**：快速訪問各個管理模組

## 🛠 技術棧

### 前端框架
- **Next.js 15** - React 全棧框架
- **React 19** - 用戶界面庫
- **TypeScript** - 類型安全的 JavaScript

### UI/UX
- **Tailwind CSS** - 實用優先的 CSS 框架
- **shadcn/ui** - 高質量的 React 組件庫
- **Lucide React** - 美觀的圖標庫
- **next-themes** - 主題切換支援

### 數據庫 & 後端
- **Supabase** - 後端即服務平台
- **PostgreSQL** - 關聯式數據庫
- **自定義 API** - 後端服務整合

### 開發工具
- **ESLint** - 代碼質量檢查
- **date-fns** - 日期處理庫
- **sonner** - 通知提示組件

## 🚀 快速開始

### 前置要求
- Node.js 18.0 或以上版本
- npm 或 yarn 或 pnpm
- Git

### 安裝步驟

1. **克隆項目**
```bash
git clone https://github.com/your-username/tickeasy-dashboard.git
cd tickeasy-dashboard
```

2. **安裝依賴**
```bash
npm install
# 或者
yarn install
# 或者
pnpm install
```

3. **環境變量配置**
```bash
cp .env.example .env.local
```

編輯 `.env.local` 文件：
```env
# Supabase 設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# API 設定
NEXT_PUBLIC_API_URL=https://tickeasy-team-backend.onrender.com
```

4. **啟動開發服務器**
```bash
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

5. **訪問應用**
打開瀏覽器並訪問 [http://localhost:3000](http://localhost:3000)

## 📁 項目結構

```
tickeasy-dashboard/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # 儀表板路由群組
│   │   └── dashboard/           # 儀表板頁面
│   │       ├── concerts/        # 演唱會管理
│   │       ├── orders/          # 訂單管理
│   │       ├── users/           # 用戶管理
│   │       └── page.tsx         # 儀表板首頁
│   ├── auth/                    # 身份驗證頁面
│   └── globals.css              # 全局樣式
├── components/                  # React 組件
│   ├── ui/                      # shadcn/ui 基礎組件
│   ├── concerts/                # 演唱會相關組件
│   ├── orders/                  # 訂單相關組件
│   ├── users/                   # 用戶相關組件
│   └── dashboard/               # 儀表板組件
├── lib/                         # 工具庫
│   ├── types/                   # TypeScript 類型定義
│   ├── supabase/                # Supabase 客戶端設定
│   └── utils.ts                 # 工具函數
├── docs/                        # 文檔
│   └── supabase.sql            # 數據庫結構
└── public/                      # 靜態資源
```

## 🔐 身份驗證

系統使用 JWT Token 進行身份驗證：

1. **登入**：用戶使用 email/password 登入
2. **Token 存儲**：Token 存儲在 localStorage
3. **權限檢查**：每個 API 請求都會驗證 Token
4. **角色權限**：基於用戶角色控制功能訪問

### 用戶角色
- **user**：一般用戶（僅查看權限）
- **admin**：管理員（審核、管理權限）
- **superuser**：超級管理員（完整權限）


## 🧪 開發指南

### 添加新組件
```bash
# 使用 shadcn/ui 添加組件
npx shadcn@latest add [component-name]
```

### 代碼規範
- 使用 TypeScript 進行類型檢查
- 遵循 ESLint 規則
- 組件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### API 整合
```typescript
// 示例：調用後端 API
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/concerts`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## 🔗 相關連結

- [Next.js 文檔](https://nextjs.org/docs)
- [Supabase 文檔](https://supabase.com/docs)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [shadcn/ui 文檔](https://ui.shadcn.com)

- 
