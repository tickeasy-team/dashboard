import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ConcertBasicInfoCard from "@/components/concerts/concert-basic-info-card";
import ConcertVenueCard from "@/components/concerts/concert-venue-card";
import ConcertReviewPanel from "@/components/concerts/concert-review-panel";
import ConcertSessionsAndTicketsCard from "@/components/concerts/concert-sessions-and-tickets-card";

export default async function ConcertDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // 直接 fetch API 取得完整演唱會資料（含 sessions）
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/concerts/${params.id}`, { cache: "no-store" });
  const { data: concert } = await res.json();

  if (!concert) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "草稿", variant: "secondary" },
      reviewing: { label: "審核中", variant: "outline" },
      published: { label: "已發布", variant: "default" },
      rejected: { label: "已拒絕", variant: "destructive" },
      finished: { label: "已完成", variant: "secondary" },
    };

    return statusConfig[status] || { label: status, variant: "outline" };
  };

  const getReviewStatusBadge = (reviewStatus: string) => {
    const reviewConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "待審核", variant: "outline" },
      approved: { label: "已通過", variant: "default" },
      rejected: { label: "已拒絕", variant: "destructive" },
      skipped: { label: "已跳過", variant: "secondary" },
    };

    return reviewConfig[reviewStatus] || { label: reviewStatus, variant: "outline" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/concerts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{concert.conTitle}</h1>
            <p className="text-muted-foreground">
              演唱會詳細資訊
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">演唱會狀態：</span>
              <Badge variant={getStatusBadge(concert.conInfoStatus).variant}>
                {getStatusBadge(concert.conInfoStatus).label}
              </Badge>
            </div>
            {concert.reviewStatus && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">審核狀態：</span>
                <Badge variant={getReviewStatusBadge(concert.reviewStatus).variant}>
                  {getReviewStatusBadge(concert.reviewStatus).label}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ConcertBasicInfoCard concert={concert} />
        <ConcertVenueCard venue={concert.venue || {}} />
      </div>

      {/* 場次與票價卡片 */}
      <ConcertSessionsAndTicketsCard sessions={concert.sessions || []} />

      {/* 傳遞 reviewStatus 參數給 ConcertReviewPanel */}
      <ConcertReviewPanel 
        concertId={concert.concertId} 
        reviewStatus={concert.reviewStatus}
      />
    </div>
  );
}