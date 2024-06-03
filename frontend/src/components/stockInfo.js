import React from 'react';
import fakeChart from '../assets/images/chart.png';

const StockInfo = () => {
  return (
    <div className="stock-info">
      <h2>台積電 2330</h2>
      <div className="stock-price">
        <span className="price">867</span>
        <span className="change">▼ 8.00 (0.91%)</span>
      </div>
      <div className="stock-details">
        <p>成交量: 34,094</p>
        <p>本益比: 26.24 (81.80)</p>
        <p>2023/12/07 開17.85 高17.9 低17.75 收17.8 量6748 漲跌0</p>
      </div>
      <div className="stock-chart">
        <img src={fakeChart} alt="Stock Chart" />
      </div>
    </div>
  );
};

export default StockInfo;
