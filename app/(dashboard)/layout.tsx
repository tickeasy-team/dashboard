"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";
import { handleCrossDomainAuth, hasValidToken } from "@/lib/auth-utils";

// Dashboard 專屬 Layout，所有 dashboard 相關頁面都會自動套用
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 處理跨域認證
    const handleAuth = () => {
      // 先檢查是否有跨域認證參數
      const hasExternalAuth = handleCrossDomainAuth();
      
      if (hasExternalAuth) {
        console.log('成功接收跨域認證，已設置 token');
        setIsLoading(false);
        return;
      }

      // 檢查 localStorage 是否有 token，無則導向前端登入頁
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("tickeasy_token");
        console.log("dashboard layout 檢查 token", token);
        
        if (!token) {
          // 導向前端登入頁面而非後台登入頁面
          window.location.href = "https://frontend-fz4o.onrender.com/login";
        } else {
          setIsLoading(false);
        }
      }
    };

    handleAuth();
  }, [router]);

  // 顯示載入狀態，避免閃爍
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      {/* 上方導覽列 */}
      <Navbar />
      {/* 主要內容區域 */}
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
    </div>
  );
} 