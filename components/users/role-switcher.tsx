"use client";

import { useState } from "react";
import { UserRole } from "@/lib/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RoleSwitcherProps {
  userId: string;
  currentRole: UserRole;
  onRoleChange: (userId: string, newRole: string) => void;
}

export function RoleSwitcher({ userId, currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
      if (!token) {
        toast.error("未登入或缺少 token");
        setIsLoading(false);
        return;
      }
      const res = await fetch("/dashboard/users/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, newRole }),
      });
      const result = await res.json();
      if (result.success) {
        onRoleChange(userId, newRole);
        toast.success("角色更新成功");
      } else {
        toast.error(result.error || "更新失敗");
      }
    } catch (error) {
      console.error("更新角色時發生錯誤:", error);
      toast.error("更新角色時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">一般用戶</SelectItem>
        <SelectItem value="admin">管理員</SelectItem>
        <SelectItem value="superuser">超級管理員</SelectItem>
      </SelectContent>
    </Select>
  );
} 