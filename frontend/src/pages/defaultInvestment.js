import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axios from 'axios'; // 使用 axios 來發送 API 請求
import { InvestmentRequest } from '../api/request/investmentRequest.js'; // 假設有這個 API

const portfolios = [
  { key: 'taiwan50', name: '台灣50' },
  { key: 'tsmc', name: '台積電' },
];

const DefaultInvestment = () => {
  const [thresholds, setThresholds] = useState({
    taiwan50: 0, // 台灣50門檻
    tsmc: 0,     // 台積電門檻
  });

  useEffect(() => {
    let totalTaiwan50 = 0;
    const taiwan50Stocks = [
      { symbol: '3037', name: '欣興' },
      { symbol: '6669', name: '緯穎' },
      { symbol: '2382', name: '廣達' },
      { symbol: '3231', name: '緯創' },
      { symbol: '2317', name: '鴻海' },
      { symbol: '2345', name: '智邦' },
      { symbol: '1590', name: '亞德客-KY' },
      { symbol: '2454', name: '聯發科' },
      { symbol: '2395', name: '研華' },
      { symbol: '2379', name: '瑞昱' },
      { symbol: '2330', name: '台積電' },
      { symbol: '2301', name: '光寶科' },
      { symbol: '4938', name: '和碩' },
      { symbol: '3711', name: '日月光投控' },
      { symbol: '1216', name: '統一' },
      { symbol: '3045', name: '台灣大' },
      { symbol: '2884', name: '玉山金' },
      { symbol: '3034', name: '聯詠' },
      { symbol: '2912', name: '統一超' },
      { symbol: '2882', name: '國泰金' },
      { symbol: '3661', name: '世芯-KY' },
      { symbol: '2880', name: '華南金' },
      { symbol: '2412', name: '中華電' },
      { symbol: '2357', name: '華碩' },
      { symbol: '2308', name: '台達電' },
      { symbol: '4904', name: '遠傳' },
      { symbol: '2885', name: '元大金' },
      { symbol: '2327', name: '國巨' },
      { symbol: '5880', name: '合庫金' },
      { symbol: '2886', name: '兆豐金' },
      { symbol: '2887', name: '台新金' },
      { symbol: '2892', name: '第一金' },
      { symbol: '2883', name: '開發金' },
      { symbol: '2891', name: '中信金' },
      { symbol: '2881', name: '富邦金' },
      { symbol: '3017', name: '奇鋐' },
      { symbol: '5876', name: '上海商銀' },
      { symbol: '2303', name: '聯電' },
      { symbol: '3008', name: '大立光' },
      { symbol: '2890', name: '永豐金' },
      { symbol: '1101', name: '台泥' },
      { symbol: '1326', name: '台化' },
      { symbol: '2207', name: '和泰車' },
      { symbol: '1303', name: '南亞' },
      { symbol: '1301', name: '台塑' },
      { symbol: '6446', name: '藥華藥' },
      { symbol: '2603', name: '長榮' },
      { symbol: '5871', name: '中租-KY' },
      { symbol: '6505', name: '台塑化' },
      { symbol: '2002', name: '中鋼' },
    ];

    const stockPromises = taiwan50Stocks.map(stock =>
      InvestmentRequest.getStockPrice(stock.symbol)
        .then(response => response.data.price || 0)
        .catch(error => {
          console.error(`無法獲取股票 ${stock.symbol} 的價格:`, error);
          return 0;
        })
    );

    Promise.all(stockPromises).then(prices => {
      totalTaiwan50 = prices.reduce((total, price) => total + price, 0);

      const calculatedThreshold = Math.ceil(totalTaiwan50);

      // 確保只發送一次請求
      setThresholds(prevThresholds => ({
        ...prevThresholds,
        taiwan50: calculatedThreshold
      }));

      updateThresholdInDatabase('台灣50', calculatedThreshold);
    });

    // 獲取台積電的即時價格
    InvestmentRequest.getStockPrice('2330') // 台積電的股票代號是 2330
      .then(response => {
        const tsmcPrice = response.data.price || 0;
        const calculatedTsmcPrice = Math.ceil(tsmcPrice);

        setThresholds(prevThresholds => ({
          ...prevThresholds,
          tsmc: calculatedTsmcPrice
        }));

        updateThresholdInDatabase('台積電', calculatedTsmcPrice);
      })
      .catch(error => {
        console.error('無法獲取台積電的價格:', error);
      });
  }, []);

  const updateThresholdInDatabase = (portfolioName, threshold) => {
    console.log(`即將發送至後端的數據: {name: '${portfolioName}', investment_threshold: ${threshold}}`);
    
    axios.post('http://localhost:8000/investment/default-investment-portfolios/', {
      name: portfolioName,
      investment_threshold: threshold
    })
    .then(response => {
      console.log("Threshold updated successfully:", response);
    })
    .catch(error => {
      console.error(`無法將 ${portfolioName} 的門檻更新至伺服器:`, error);
    });
  };

  const columns = [
    {
      title: '投資組合',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '投資門檻 (NT$)',
      key: 'threshold',
      render: (text, record) => {
        const portfolioKey = record.key;
        const threshold = thresholds[portfolioKey] || 0;
        return `NT$ ${threshold.toLocaleString()}`;
      },
    },
  ];

  return (
    <div className='container' style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 className="title">投資門檻總覽</h1>
      <Table
        columns={columns}
        dataSource={portfolios}
        pagination={false}
        bordered
        rowKey="key"
        style={{ textAlign: 'center' }}
      />
    </div>
  );
};

export default DefaultInvestment;
