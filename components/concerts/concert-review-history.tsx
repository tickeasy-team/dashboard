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

// 處理換行符號 - 將 \n 轉換為真正的換行
function processLineBreaks(text: string): string {
  if (!text) return "";
  return text.replace(/\\n/g, '\n');
}

// 將 AI 審核結果格式化為可讀文字
const formatAIText = (r: ReviewRecord) => {
  if (!r.aiResponse) return "";
  const sections: string[] = [];
  if (r.aiResponse.summary) {
    sections.push(`AI 審核摘要：\n${processLineBreaks(r.aiResponse.summary)}`);
  }
  if (r.aiResponse.reasons && r.aiResponse.reasons.length) {
    const list = r.aiResponse.reasons.map((it) => `- ${processLineBreaks(it)}`).join("\n");
    sections.push(`AI 主要理由：\n${list}`);
  }
  if (r.aiResponse.suggestions && r.aiResponse.suggestions.length) {
    const list = r.aiResponse.suggestions.map((it) => `- ${processLineBreaks(it)}`).join("\n");
    sections.push(`AI 建議調整：\n${list}`);
  }
  if (r.aiResponse.flaggedContent && r.aiResponse.flaggedContent.length) {
    const list = r.aiResponse.flaggedContent.map((it) => `- ${processLineBreaks(it)}`).join("\n");
    sections.push(`AI 標記內容：\n${list}`);
  }
  return sections.join("\n\n");
};

// 複製到剪貼簿
const handleCopy = async (rec: ReviewRecord) => {
  try {
    const text = formatAIText(rec);
    // console.log("[AI Review Copy]", text); // 在生產環境不顯示
    await navigator.clipboard.writeText(text);
    toast.success("AI 審核結果已複製");
  } catch {
    toast.error("複製失敗，請重試");
  }
};

// 過往審核紀錄元件，顯示所有歷史審核紀錄
const ConcertReviewHistory: React.FC<ConcertReviewHistoryProps> = ({ concertId }) => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  
  // 🔧 除錯開關 - 設為 true 時顯示除錯面板
  // 👉 如需除錯：將下列 false 改為 true
  const SHOW_DEBUG = false; // ✅ 关闭 debug 面板，但保留 console 输出

  // 確保組件已經在客戶端掛載
  useEffect(() => {
    setMounted(true);
    if (SHOW_DEBUG) console.log("🚀 ConcertReviewHistory 組件已掛載");
  }, []);

  useEffect(() => {
    if (!mounted) {
      if (SHOW_DEBUG) console.log("⏳ 組件尚未掛載，等待中...");
      return;
    }
    
    if (!concertId) {
      if (SHOW_DEBUG) console.log("❌ ConcertId 不存在:", concertId);
      setError("演唱會 ID 不存在");
      return;
    }

    if (SHOW_DEBUG) {
      console.log("🚀 開始載入審核紀錄");
      console.log("📍 Concert ID:", concertId);
      console.log("🌍 環境:", process.env.NODE_ENV);
      console.log("🔗 API URL base:", process.env.NEXT_PUBLIC_API_URL);
    }
    
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    // 延遲執行，確保 localStorage 完全可用
    const timer = setTimeout(() => {
      // 檢查 token
      const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
      
      if (SHOW_DEBUG) {
        console.log("🔑 Token 檢查:");
        console.log("  - 存在:", token ? "是" : "否");
        console.log("  - 長度:", token?.length || 0);
        console.log("  - 前20字元:", token?.substring(0, 20) + "...");
      }

      const apiUrl = `https://tickeasy-team-backend.onrender.com/api/v1/concerts/${concertId}/reviews`;
      if (SHOW_DEBUG) console.log("📡 完整 API URL:", apiUrl);

      const headers = {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      };
      if (SHOW_DEBUG) {
        console.log("📋 Request headers:", headers);
        console.log("⏰ 發送 API 請求時間:", new Date().toISOString());
      }

      fetch(apiUrl, { 
        headers,
        method: 'GET',
        cache: 'no-cache'
      })
        .then(async (res) => {
          if (SHOW_DEBUG) {
            console.log("📥 Response 收到:");
            console.log("  - Status:", res.status);
            console.log("  - Status Text:", res.statusText);
            console.log("  - Headers:", Object.fromEntries(res.headers.entries()));
            console.log("  - URL:", res.url);
            console.log("  - OK:", res.ok);
          }
          
          if (!res.ok) {
            const errorText = await res.text();
            if (SHOW_DEBUG) console.log("❌ Response error text:", errorText);
            throw new Error(`HTTP ${res.status}: ${res.statusText}\n${errorText}`);
          }
          
          const data = await res.json();
          if (SHOW_DEBUG) console.log("✅ Response JSON 解析成功");
          return data;
        })
        .then(data => {
          // ✨ 始终打印完整的 API 回应数据，方便查看审核记录
          console.log("🎆 === 審核記錄 API 回應 ===", data);
          
          // 在瀏覽器 console 印出完整 API 回傳資料，方便除錯
          if (SHOW_DEBUG) {
            console.log("🎯 [API Response Data]", data);
            console.log("📊 資料結構分析:");
            console.log("  - typeof data:", typeof data);
            console.log("  - data.status:", data?.status);
            console.log("  - data.message:", data?.message);
            console.log("  - typeof data.data:", typeof data?.data);
            console.log("  - Array.isArray(data.data):", Array.isArray(data?.data));
            console.log("  - data.data?.reviews:", data?.data?.reviews);
            console.log("  - Array.isArray(data.data?.reviews):", Array.isArray(data?.data?.reviews));
          }
          
          setDebugInfo(data);
          
          let arr: ReviewRecord[] = [];
          
          // 嘗試多種資料結構
          if (data.status === "success" && data.data && Array.isArray(data.data.reviews)) {
            arr = data.data.reviews;
            if (SHOW_DEBUG) console.log("✅ 使用 data.data.reviews 路徑，筆數:", arr.length);
          } else if (data.status === "success" && Array.isArray(data.data)) {
            arr = data.data;
            if (SHOW_DEBUG) console.log("✅ 使用 data.data 路徑，筆數:", arr.length);
          } else if (Array.isArray(data)) {
            arr = data;
            if (SHOW_DEBUG) console.log("✅ 使用 data 直接路徑，筆數:", arr.length);
          } else if (data.reviews && Array.isArray(data.reviews)) {
            arr = data.reviews;
            if (SHOW_DEBUG) console.log("✅ 使用 data.reviews 路徑，筆數:", arr.length);
          } else {
            if (SHOW_DEBUG) {
              console.log("⚠️ 無法解析的資料結構:", data);
              console.log("📝 嘗試的路徑都不符合，設為空陣列");
            }
          }
          
          if (SHOW_DEBUG) {
            console.log("📋 原始紀錄數據:");
            arr.forEach((record, index) => {
              console.log(`  記錄 ${index + 1}:`, {
                reviewId: record.reviewId,
                reviewStatus: record.reviewStatus,
                reviewType: record.reviewType,
                createdAt: record.createdAt,
                hasAiResponse: !!record.aiResponse
              });
              
              // 打印完整的審核紀錄
              console.log(`  📄 記錄 ${index + 1} 完整資料:`, record);
              
              // 如果有 AI 回應，詳細打印
              if (record.aiResponse) {
                console.log(`  🤖 記錄 ${index + 1} AI 回應:`, record.aiResponse);
                console.log(`  📝 記錄 ${index + 1} AI 摘要:`, record.aiResponse.summary);
                console.log(`  📝 記錄 ${index + 1} AI 摘要(處理後):`, processLineBreaks(record.aiResponse.summary || ""));
                console.log(`  📋 記錄 ${index + 1} AI 理由:`, record.aiResponse.reasons);
                console.log(`  💡 記錄 ${index + 1} AI 建議:`, record.aiResponse.suggestions);
                console.log(`  🚩 記錄 ${index + 1} AI 標記內容:`, record.aiResponse.flaggedContent);
              }
              
              // 審核意見
              if (record.reviewerNote || record.reviewNote) {
                console.log(`  💬 記錄 ${index + 1} 審核意見:`, record.reviewerNote || record.reviewNote);
              }
              
              console.log("---"); // 分隔線
            });
          }
          
          // 以時間倒序排列
          const sortedRecords = [...arr].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          if (SHOW_DEBUG) console.log("📋 排序後最終設定的紀錄數:", sortedRecords.length);
          
          setRecords(sortedRecords);
          setError(null);
        })
        .catch((err) => {
          if (SHOW_DEBUG) {
            console.error("❌ [API Error]", err);
            console.error("❌ Error stack:", err.stack);
          }
          setError(err.message);
          setRecords([]);
          setDebugInfo({ error: err.message, stack: err.stack });
        })
        .finally(() => {
          setLoading(false);
          if (SHOW_DEBUG) console.log("🏁 API 請求完成，時間:", new Date().toISOString());
        });
    }, 200); // 延遲 200ms 確保環境準備好

    return () => {
      clearTimeout(timer);
      if (SHOW_DEBUG) console.log("🧹 清理計時器");
    };
  }, [concertId, mounted]);

  // 在服務端或尚未掛載時的處理
  if (!mounted) {
    if (SHOW_DEBUG) console.log("⏳ 組件尚未掛載，顯示載入狀態");
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">審核紀錄</h2>
        <div className="text-sm text-muted-foreground">初始化中...</div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-2">審核紀錄</h2>
      
      {/* 🔧 Debug 資訊區塊 - 只在開發模式或 SHOW_DEBUG 為 true 時顯示 */}
      {SHOW_DEBUG && (
        <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono">
          <div className="font-bold text-blue-700 mb-2">🔍 除錯資訊:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Concert ID: <span className="text-blue-600">{concertId || "未設定"}</span></div>
            <div>Loading: <span className={loading ? "text-orange-600" : "text-green-600"}>{loading.toString()}</span></div>
            <div>Mounted: <span className={mounted ? "text-green-600" : "text-red-600"}>{mounted.toString()}</span></div>
            <div>Records Count: <span className="text-purple-600">{records.length}</span></div>
          </div>
          
          {error && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
              <div className="font-bold">❌ 錯誤:</div>
              <div className="text-xs mt-1">{error}</div>
            </div>
          )}
          
          <div className="mt-2">
            Token: <span className={typeof window !== "undefined" && localStorage.getItem("tickeasy_token") ? "text-green-600" : "text-red-600"}>
              {typeof window !== "undefined" && localStorage.getItem("tickeasy_token") ? "存在" : "不存在"}
            </span>
          </div>
          
          {debugInfo && (
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-700 hover:text-blue-900">
                📄 查看完整 API 回應 ({JSON.stringify(debugInfo).length} 字元)
              </summary>
              <div className="mt-2 p-2 bg-white rounded border max-h-60 overflow-auto">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          )}
          
          {/* 快速測試按鈕 */}
          <button 
            onClick={() => {
              if (SHOW_DEBUG) {
                console.clear();
                console.log("🔄 手動重新載入審核紀錄");
              }
              window.location.reload();
            }}
            className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            🔄 重新載入
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <div className="animate-spin">⏳</div>
          載入中...
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded border">
          <div className="font-medium">載入失敗:</div>
          <div className="mt-1 text-xs">{error}</div>
          <div className="mt-2 text-xs text-gray-600">
            💡 請檢查：
            <ul className="list-disc ml-4 mt-1">
              <li>網路連線是否正常</li>
              <li>是否已登入 (Token 是否存在)</li>
              <li>演唱會 ID 是否正確</li>
              <li>後端 API 服務是否正常</li>
            </ul>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded border">
          📝 尚無審核紀錄
          <div className="text-xs mt-1 text-gray-600">
            此演唱會可能尚未進行過任何審核，或資料尚未同步。
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-green-600 mb-2">
            ✅ 成功載入 {records.length} 筆審核紀錄
          </div>
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
                <div>
                  <span className="font-semibold">審核意見：</span>
                  <span className="whitespace-pre-wrap">{processLineBreaks(record.reviewerNote || record.reviewNote || "")}</span>
                </div>
              )}
              {/* AI 審核摘要 */}
              {record.aiResponse?.summary && (
                <div>
                  <span className="font-semibold">AI 審核摘要：</span>
                  <span className="whitespace-pre-wrap">{processLineBreaks(record.aiResponse.summary)}</span>
                </div>
              )}
              {/* AI 判定結果：若 aiResponse.approved 缺失，根據 reviewStatus 推斷 */}
              {(() => {
                // 先取 aiResponse.approved；若不存在則根據 reviewStatus 推斷
                const approvedFlag =
                  record.aiResponse?.approved !== undefined
                    ? record.aiResponse?.approved
                    : record.reviewType === "ai_auto"
                      ? (record.reviewStatus === "approved" ? true : record.reviewStatus === "rejected" ? false : undefined)
                      : undefined;
                return approvedFlag !== undefined ? (
                  <div>
                    <span className="font-semibold">AI 判定結果：</span>
                    {approvedFlag ? (
                      <span className="text-green-600 font-semibold">✅ 通過</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ 未通過</span>
                    )}
                  </div>
                ) : null;
              })()}
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
                      <li key={i} className="whitespace-pre-wrap">{processLineBreaks(r)}</li>
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
                      <li key={i} className="whitespace-pre-wrap">{processLineBreaks(c)}</li>
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
                      <li key={i} className="whitespace-pre-wrap">{processLineBreaks(s)}</li>
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