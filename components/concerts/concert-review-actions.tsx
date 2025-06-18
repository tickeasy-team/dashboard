"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/auth-utils";

interface ConcertReviewActionsProps {
  concertId: string;
  onReviewComplete: (newStatus: "approved" | "rejected") => void;
}

// 人工審核操作元件，管理者可輸入備註並通過/拒絕審核
const ConcertReviewActions: React.FC<ConcertReviewActionsProps> = ({ concertId, onReviewComplete }) => {
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 二次確認相關 state
  const [confirmAction, setConfirmAction] = useState<"approved" | "rejected" | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 觸發二次確認對話框
  const openConfirm = (action: "approved" | "rejected") => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  // 真正送出審核請求
  const submitReview = async () => {
    if (!confirmAction) return;

    if (!reviewNote.trim()) {
      toast.error("請輸入審核意見");
      return;
    }

    setIsLoading(true);
    try {
      // 從 localStorage 取得 token，並加到 Authorization header
      const token = typeof window !== "undefined" ? getAuthToken() : null;
      const res = await fetch("/dashboard/concerts/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          concertId,
          reviewStatus: confirmAction,
          reviewerNote: reviewNote,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(confirmAction === "approved" ? "演唱會已通過審核" : "演唱會已拒絕");
        setReviewNote("");
        onReviewComplete(confirmAction);
      } else {
        toast.error(result.error || "審核失敗");
      }
    } catch (error) {
      console.error("審核時發生錯誤:", error);
      toast.error("審核時發生錯誤");
    } finally {
      setIsLoading(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="card mt-6">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">人工審核操作</h2>
      <div className="space-y-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={8}
          placeholder="請輸入審核備註（選填）"
          value={reviewNote}
          onChange={e => setReviewNote(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex gap-4 mt-2">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            onClick={() => openConfirm("approved")}
            disabled={isLoading}
          >
            通過
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={() => openConfirm("rejected")}
            disabled={isLoading}
          >
            拒絕
          </button>
        </div>
      </div>

      {/* 確認彈窗 */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>審核確認</DialogTitle>
            <DialogDescription>
              {confirmAction === "approved"
                ? "確定要『通過』此演唱會審核嗎？"
                : "確定要『拒絕』此演唱會審核嗎？"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)} disabled={isLoading}>
              取消
            </Button>
            <Button
              variant={confirmAction === "approved" ? "default" : "destructive"}
              onClick={submitReview}
              disabled={isLoading}
            >
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConcertReviewActions; 