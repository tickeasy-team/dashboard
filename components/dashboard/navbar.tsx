"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Avatar from "@radix-ui/react-avatar";

// 導覽列項目
const navItems = [
  { href: "/dashboard/users", label: "用戶管理" },
  { href: "/dashboard/concerts", label: "演唱會管理" },
  { href: "/dashboard/orders", label: "訂單管理" },
];

interface User {
  email: string;
  name?: string;
  avatar?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // 初始化時從 localStorage 獲取用戶資訊
  useEffect(() => {
    const userString = localStorage.getItem("tickeasy_user");
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        setUser(userData);
      } catch (error) {
        console.error("解析用戶資訊失敗:", error);
      }
    }
  }, []);

  // 登出功能
  const handleLogout = () => {
    // 清除 localStorage
    localStorage.removeItem("tickeasy_token");
    localStorage.removeItem("tickeasy_user");
    
    // 重定向到登入頁面
    router.push("/auth/login");
  };

  return (
    <nav className="w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-8 h-14">
        {/* 左側：Logo + 導覽列 */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Tickeasy Logo" width={150} height={48} />
          </Link>
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-medium hover:text-primary transition ${
                    pathname.startsWith(item.href)
                      ? "text-primary underline"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 右側：用戶資訊/登出 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* 用戶大頭貼 */}
              <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                {user.avatar ? (
                  <Image 
                    src={user.avatar} 
                    alt="用戶頭像" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                )}
              </Avatar.Root>
              
              {/* 用戶名稱 */}
              <span className="font-medium text-sm">
                {user.name || user.email.split("@")[0]}
              </span>
              
              {/* 登出按鈕 */}
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            /* 如果沒有用戶資訊，顯示登入連結 */
            <Link 
              href="/auth/login"
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm transition-colors"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}