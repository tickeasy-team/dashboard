"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// AI 回應型別
interface AIResponse {
  summary?: string;
  reasons?: string[];
  suggestions?: string[];
  approved?: boolean;
  confidence?: number; // 0–1 之間
  flaggedContent?: string[];
  requiresManualReview?: boolean;
  rawResponse?: Record<string, unknown>;
}

interface ReviewRecord {
  reviewId?: string;
  concertId?: string;
  reviewType?: string; // "ai_auto" 或其他
  reviewStatus: string;
  reviewNote?: string | null; // 舊欄位
  reviewerNote?: string | null; // 新欄位
  reviewerId?: string | null;
  aiResponse?: AIResponse;
  createdAt: string;
  updatedAt?: string;
}

interface ConcertReviewHistoryProps {
  concertId: string;
}

// 狀態中文對應
const statusMap: Record<string, string> = {
  pending: "待審核",
  approved: "已通過",
  rejected: "已拒絕",
};

// 時間格式化
function formatDate(iso: string) {
  const date = new Date(iso);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

// 將 AI 審核結果格式化為可讀文字
const formatAIText = (r: ReviewRecord) => {
  if (!r.aiResponse) return "";
  const sections: string[] = [];
  if (r.aiResponse.summary) {
    sections.push(`AI 審核摘要：\n${r.aiResponse.summary}`);
  }
  if (r.aiResponse.reasons && r.aiResponse.reasons.length) {
    const list = r.aiResponse.reasons.map((it) => `- ${it}`).join("\n");
    sections.push(`AI 主要理由：\n${list}`);
  }
  if (r.aiResponse.suggestions && r.aiResponse.suggestions.length) {
    const list = r.aiResponse.suggestions.map((it) => `- ${it}`).join("\n");
    sections.push(`AI 建議調整：\n${list}`);
  }
  if (r.aiResponse.flaggedContent && r.aiResponse.flaggedContent.length) {
    const list = r.aiResponse.flaggedContent.map((it) => `- ${it}`).join("\n");
    sections.push(`AI 標記內容：\n${list}`);
  }
  return sections.join("\n\n");
};

// 複製到剪貼簿
const handleCopy = async (rec: ReviewRecord) => {
  try {
    await navigator.clipboard.writeText(formatAIText(rec));
    toast.success("AI 審核結果已複製");
  } catch {
    toast.error("複製失敗，請重試");
  }
};

// 過往審核紀錄元件，顯示所有歷史審核紀錄
const ConcertReviewHistory: React.FC<ConcertReviewHistoryProps> = ({ concertId }) => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!concertId) return;
    setLoading(true);
    // 從 localStorage 取得 token，並加到 Authorization header
    const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
    fetch(`https://tickeasy-team-backend.onrender.com/api/v1/concerts/${concertId}/reviews`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        let arr: ReviewRecord[] = [];
        if (data.status === "success" && data.data && Array.isArray(data.data.reviews)) {
          arr = data.data.reviews;
        } else if (data.status === "success" && Array.isArray(data.data)) {
          arr = data.data;
        }
        // 以時間倒序排列
        setRecords([...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [concertId]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">審核紀錄</h2>
      {loading ? (
        <div className="text-sm text-muted-foreground">載入中...</div>
      ) : records.length === 0 ? (
        <div className="text-sm text-muted-foreground">尚無審核紀錄</div>
      ) : (
        <div className="space-y-3">
          {records.map((record, idx) => (
            <div key={record.reviewId || idx} className="bg-gray-50 rounded p-3 space-y-1 border">
              <div className="flex items-center gap-2">
                <span className="font-semibold">狀態：</span>
                <span>{statusMap[record.reviewStatus] || record.reviewStatus}</span>
                {record.reviewType === "ai_auto" && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">AI</span>}
                {record.reviewType === "ai_auto" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => handleCopy(record)}
                  >
                    複製
                  </Button>
                )}
              </div>
              {/* 審核意見 */}
              {(record.reviewerNote || record.reviewNote) && (
                <div><span className="font-semibold">審核意見：</span>{record.reviewerNote || record.reviewNote}</div>
              )}
              {/* AI 審核摘要 */}
              {record.aiResponse?.summary && (
                <div>
                  <span className="font-semibold">AI 審核摘要：</span>
                  <span className="whitespace-pre-wrap">{record.aiResponse.summary}</span>
                </div>
              )}
              {/* AI 判定結果 */}
              {record.aiResponse?.approved !== undefined && (
                <div>
                  <span className="font-semibold">AI 判定結果：</span>
                  {record.aiResponse.approved ? (
                    <span className="text-green-600 font-semibold">✅ 通過</span>
                  ) : (
                    <span className="text-red-600 font-semibold">❌ 未通過</span>
                  )}
                </div>
              )}
              {/* AI 信心度 */}
              {record.aiResponse?.confidence !== undefined && (
                <div><span className="font-semibold">AI 信心度：</span>{Math.round((record.aiResponse.confidence || 0) * 100)}%</div>
              )}
              {/* 需人工複審 */}
              {record.aiResponse?.requiresManualReview && (
                <div className="text-yellow-700"><span className="font-semibold">需人工複審：</span>是</div>
              )}
              {/* AI 主要理由 */}
              {record.aiResponse?.reasons && record.aiResponse.reasons.length > 0 && (
                <div>
                  <span className="font-semibold">AI 主要理由：</span>
                  <ul className="list-disc pl-5">
                    {record.aiResponse.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 被標記內容 */}
              {record.aiResponse?.flaggedContent && record.aiResponse.flaggedContent.length > 0 && (
                <div>
                  <span className="font-semibold">AI 標記內容：</span>
                  <ul className="list-disc pl-5 text-red-600">
                    {record.aiResponse.flaggedContent.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* AI 建議調整 */}
              {record.aiResponse?.suggestions && record.aiResponse.suggestions.length > 0 && (
                <div>
                  <span className="font-semibold">AI 建議調整：</span>
                  <ul className="list-disc pl-5">
                    {record.aiResponse.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 原始回應 (收合) */}
              {record.aiResponse?.rawResponse && (
                <details className="mt-1 select-text whitespace-pre-wrap break-all bg-gray-100 rounded p-2">
                  <summary className="cursor-pointer font-semibold text-sm">查看原始 JSON</summary>
                  <pre className="text-xs">{JSON.stringify(record.aiResponse.rawResponse, null, 2)}</pre>
                </details>
              )}
              {/* 審核人員 */}
              <div><span className="font-semibold">審核人員：</span>{record.reviewerId ? record.reviewerId : (record.reviewType === "ai_auto" ? "AI" : "系統")}</div>
              {/* 審核時間 */}
              <div><span className="font-semibold">審核時間：</span>{formatDate(record.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertReviewHistory; 