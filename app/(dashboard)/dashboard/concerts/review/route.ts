import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// 只允許 POST 請求
export async function POST(req: NextRequest) {
  try {
    const { concertId, status, notes } = await req.json();

    // 從前端 header 取得 token
    const authHeader = req.headers.get("authorization"); // 取得 Authorization: Bearer <token>
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "缺少授權資訊" }, { status: 401 });
    }

    // 直接呼叫後端 API，讓後端處理認證與權限
    const apiRes = await fetch(
      `https://tickeasy-team-backend.onrender.com/api/v1/${concertId}/manual-review`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader, // 轉發 token 給後端
        },
        body: JSON.stringify({ status, notes }),
      }
    );
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json({ success: false, error: errorText || "外部 API 調用失敗" }, { status: 500 });
    }

    // 重新驗證快取
    revalidatePath("/dashboard/concerts");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("審核錯誤:", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
} 