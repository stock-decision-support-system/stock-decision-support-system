import React, { useState } from 'react';
import StockTable from '../components/stockTable';

const StockList = () => {
  const [selectedStocks, setSelectedStocks] = useState([]);

  const handleCheckboxChange = (e, code) => {
    if (e.target.checked) {
      setSelectedStocks([...selectedStocks, code]);
    } else {
      setSelectedStocks(selectedStocks.filter(stockCode => stockCode !== code));
    }
  };

  const data = [
    {
      key: '1',
      name: '台積電',
      code: '2330',
      price: 600,
      change: 10,
      changePercent: 1.69,
      open: 590,
      previousClose: 590,
      high: 605,
      low: 585,
      volume: 25000,
      time: '2024-08-08 14:30'
    },
    {
      key: '2',
      name: '鴻海',
      code: '2317',
      price: 100,
      change: -2,
      changePercent: -1.96,
      open: 102,
      previousClose: 102,
      high: 103,
      low: 99,
      volume: 30000,
      time: '2024-08-08 14:30'
    }
  ];

  return (
    <div className="position-absolute top-50 start-50 translate-middle w-75 h-75">
      <StockTable data={data} onCheckboxChange={handleCheckboxChange} />
    </div>
  );
};

export default StockList;