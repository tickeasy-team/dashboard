"use client";
import React, { useState } from "react";
import ConcertReviewHistory from "./concert-review-history";
import ConcertReviewActions from "./concert-review-actions";

interface ConcertReviewPanelProps {
  concertId: string;
  reviewStatus?: string; // 新增審核狀態參數
}

// 審核面板，整合審核紀錄與操作，審核後自動刷新紀錄
const ConcertReviewPanel: React.FC<ConcertReviewPanelProps> = ({ 
  concertId, 
  reviewStatus 
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(reviewStatus);

  // 當審核完成時，刷新紀錄並更新狀態
  const handleReviewComplete = (newStatus: "approved" | "rejected") => {
    setRefreshKey((k) => k + 1);
    setCurrentStatus(newStatus);
  };

  return (
    <div>
      <ConcertReviewHistory key={refreshKey} concertId={concertId} />
      {/* 只有當審核狀態為 'pending' 時才顯示審核操作區塊 */}
      {currentStatus === 'pending' && (
        <ConcertReviewActions concertId={concertId} onReviewComplete={handleReviewComplete} />
      )}
    </div>
  );
};

export default ConcertReviewPanel;