// 已移除 Supabase 依賴，改為純客戶端函數

export async function reviewConcert(
  concertId: string,
  reviewData: {
    status: "approved" | "rejected";
    notes?: string;
  }
) {
  try {
    // 從 localStorage 取得 token（需於前端呼叫）
    const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
    if (!token) {
      return { success: false, error: "未登入或缺少 token" };
    }

    // 呼叫後端 API，帶上 token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${concertId}/manual-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText || "API 調用失敗" };
    }

    // 審核成功
    return { success: true };
  } catch (error) {
    console.error("Review error:", error);
    return { success: false, error: "審核失敗" };
  }
} 