import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axios from 'axios';
import { config } from '../config';

const BASE_URL = config.API_URL

const MyStocks = () => {
  const [stockData, setStockData] = useState([]);
  const [profitLossData, setProfitLossData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token'); // 從 localStorage 獲取保存的 Token
    const startDate = "2024-05-05";  // 假設默認的開始日期
    const endDate = "2024-10-13";    // 假設默認的結束日期
  
    axios.get(`${BASE_URL}/api/portfolio-status/`, {
      headers: {
        Authorization: `Bearer ${token}`,  // 在請求中加入 Token
      },
      params: {
        start_date: startDate,
        end_date: endDate
      }
    })
    .then(response => {
      const { positions, profit_loss } = response.data;
      setStockData(positions);
      setProfitLossData(profit_loss);
    })
    .catch(error => {
      console.error('無法獲取持有股票或損益資料:', error);
      if (error.response) {
        // 打印返回的錯誤訊息及詳細資料
        console.log('錯誤的狀態碼:', error.response.status);
        console.log('錯誤的資料:', error.response.data);
        console.log('錯誤的標頭:', error.response.headers);
      } else if (error.request) {
        // 請求發出但無回應
        console.log('請求發出但無回應:', error.request);
      } else {
        // 其他錯誤
        console.log('錯誤訊息:', error.message);
      }
      console.log('完整的錯誤配置:', error.config);
    });
  }, []);

  const columns = [
    {
      title: '股票代號',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '股票名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '股數',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => `${text} 股`,
    },
    {
      title: '持倉狀態',
      dataIndex: 'direction',
      key: 'direction',
    },
    {
      title: '目前價格 (NT$)',
      dataIndex: 'last_price',
      key: 'last_price',
      render: (price) => `NT$ ${price.toLocaleString()}`,
    },
    {
      title: '損益 (NT$)',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => `NT$ ${pnl.toLocaleString()}`,
    },
  ];

  return (
    <div className='container'>
      <h1 className="title" style={{marginTop:'-15%'}}>我的股票持有狀況與損益</h1>
      <Table 
        columns={columns} 
        dataSource={stockData} 
        rowKey="id"
        pagination={{ pageSize: 8 }}  // 每頁顯示 5 筆資料 
      />
    </div>
  );
};

export default MyStocks;
