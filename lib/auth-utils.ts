/**
 * 跨域認證工具函數
 * 處理從前端傳遞過來的認證參數
 */

/**
 * 處理跨域認證參數
 * 從 URL 參數中獲取 token 和 userInfo，並設置到 localStorage
 */
export const handleCrossDomainAuth = (): boolean => {
  // 確保在客戶端環境
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userInfo = urlParams.get('userInfo');

  if (token && userInfo) {
    try {
      // 解碼用戶資訊
      const decodedUserInfo = decodeURIComponent(userInfo);
      const parsedUserInfo = JSON.parse(decodedUserInfo);

      // 設置 token（對應後台的 tickeasy_token）
      localStorage.setItem('tickeasy_token', token);

      // 設置用戶資訊（對應後台的 tickeasy_user）
      // 需要轉換前端的格式到後台格式
      const backendUserFormat = {
        email: parsedUserInfo.email || '',
        role: parsedUserInfo.role || 'user',
        // 可能需要根據實際需求調整其他欄位
      };

      localStorage.setItem('tickeasy_user', JSON.stringify(backendUserFormat));

      // 清除 URL 參數，避免刷新頁面時重複處理
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      console.log('跨域認證成功，已設置 token 和用戶資訊');
      return true;
    } catch (error) {
      console.error('處理跨域認證參數失敗:', error);
      return false;
    }
  }

  return false;
};

/**
 * 檢查是否有有效的認證 token
 */
export const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('tickeasy_token');
  return !!token;
};

/**
 * 清除所有認證資訊並導向前端登入
 */
export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('tickeasy_token');
  localStorage.removeItem('tickeasy_user');
  
  // 導向前端登入頁面
  window.location.href = 'https://frontend-fz4o.onrender.com/login';
};

/**
 * 獲取當前用戶資訊
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('tickeasy_user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('解析用戶資訊失敗:', error);
    return null;
  }
};
