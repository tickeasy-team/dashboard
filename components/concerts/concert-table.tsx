"use client";

import { useState } from "react";
import { Concert } from "@/lib/types/concert";
import { ConcertFilters } from "./concert-filters";
import { ReviewDialog } from "./review-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import Link from "next/link";
import { Eye } from "lucide-react";

interface ConcertTableProps {
  concerts: Concert[];
}

export function ConcertTable({ concerts: initialConcerts }: ConcertTableProps) {
  const [concerts, setConcerts] = useState(initialConcerts);
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const filteredConcerts = concerts.filter((concert) => {
    const matchesStatus = filteredStatus === "all" || concert.conInfoStatus === filteredStatus;
    const matchesSearch = 
      concert.conTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concert.organization?.orgName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // 演唱會狀態標籤
  const getStatusBadge = (status: Concert["conInfoStatus"]) => {
    const statusConfig = {
      draft: { label: "草稿", variant: "secondary" as const },
      reviewing: { label: "審核中", variant: "outline" as const },
      published: { label: "已發布", variant: "default" as const },
      rejected: { label: "已拒絕", variant: "destructive" as const },
      finished: { label: "已完成", variant: "secondary" as const },
    };

    return (
      <Badge variant={statusConfig[status].variant}>
        {statusConfig[status].label}
      </Badge>
    );
  };

  // 審核狀態標籤
  const getReviewStatusBadge = (reviewStatus?: Concert["reviewStatus"]) => {
    if (!reviewStatus || reviewStatus === 'skipped') {
      return (
        <Badge variant="secondary" className="text-xs">
          已跳過
        </Badge>
      );
    }

    const reviewConfig = {
      pending: { label: "待審核", variant: "outline" as const },
      approved: { label: "已通過", variant: "default" as const },
      rejected: { label: "已拒絕", variant: "destructive" as const },
    };

    return (
      <Badge variant={reviewConfig[reviewStatus].variant} className="text-xs">
        {reviewConfig[reviewStatus].label}
      </Badge>
    );
  };

  const handleReview = (concert: Concert) => {
    setSelectedConcert(concert);
    setIsReviewDialogOpen(true);
  };

  const handleReviewComplete = (concertId: string, newStatus: string) => {
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.concertId === concertId
          ? { ...concert, reviewStatus: newStatus as Concert["reviewStatus"] }
          : concert
      )
    );
  };

  return (
    <div className="space-y-4">
      <ConcertFilters
        onStatusChange={setFilteredStatus}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>演唱會名稱</TableHead>
              <TableHead>主辦單位</TableHead>
              <TableHead>場地</TableHead>
              <TableHead>活動日期</TableHead>
              <TableHead>演唱會狀態</TableHead>
              <TableHead>審核狀態</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConcerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  沒有找到演唱會
                </TableCell>
              </TableRow>
            ) : (
              filteredConcerts.map((concert) => (
                <TableRow key={concert.concertId}>
                  <TableCell className="font-medium">
                    {concert.conTitle}
                  </TableCell>
                  <TableCell>
                    {concert.organization?.orgName || "-"}
                  </TableCell>
                  <TableCell>
                    {concert.venue?.venueName || concert.conLocation || "-"}
                  </TableCell>
                  <TableCell>
                    {concert.eventStartDate
                      ? format(new Date(concert.eventStartDate), "yyyy/MM/dd", {
                          locale: zhTW,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(concert.conInfoStatus)}
                  </TableCell>
                  <TableCell>
                    {getReviewStatusBadge(concert.reviewStatus)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(concert.createdAt), "yyyy/MM/dd", {
                      locale: zhTW,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/concerts/${concert.concertId}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {concert.conInfoStatus === "reviewing" && 
                       concert.reviewStatus === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(concert)}
                        >
                          審核
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReviewDialog
        concert={selectedConcert}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onReviewComplete={handleReviewComplete}
      />
    </div>
  );
}