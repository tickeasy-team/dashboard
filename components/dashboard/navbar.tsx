"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as Avatar from "@radix-ui/react-avatar";

// 導覽列項目
const navItems = [
  { href: "/dashboard/users", label: "用戶管理" },
  { href: "/dashboard/concerts", label: "演唱會管理" },
  { href: "/dashboard/orders", label: "訂單管理" },
];

export default function Navbar() {
  const pathname = usePathname();

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
        {/* 右側：用戶資訊/登入註冊 */}
        <div className="flex items-center gap-3">
          {/* 用戶大頭貼 */}
          <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden border">
            {/* 用戶大頭貼 */}
          </Avatar.Root>
          {/* 用戶名稱 */}
          <span className="font-medium">
            {/* 用戶名稱 */}
          </span>
          {/* 登出按鈕 */}
          <button
            className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            登出
          </button>
        </div>
      </div>
    </nav>
  );
} 