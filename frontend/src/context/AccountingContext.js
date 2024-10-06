import React, { createContext, useState, useContext, useEffect } from 'react';
import { AccountingRequest } from '../api/request/accountingRequest.js'; // API 請求

// 創建一個 Context
const AccountingContext = createContext();

export const useAccounting = () => {
  return useContext(AccountingContext);
};

// 提供 Context 的組件
export const AccountingProvider = ({ children }) => {
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // 獲取總金額的 API 請求
    AccountingRequest.getFinancialSummary()
      .then(response => {
        setTotalAmount(response.data);
      })
      .catch((error) => {
        alert(error.message);
      });
  }, []); // 當提供者組件初次加載時發送請求

  return (
    <AccountingContext.Provider value={{ totalAmount, setTotalAmount }}>
      {children}
    </AccountingContext.Provider>
  );
};
