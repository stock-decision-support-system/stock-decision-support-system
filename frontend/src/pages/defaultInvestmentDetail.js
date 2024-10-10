import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Card, Statistic } from 'antd';
import axios from 'axios';
import { config } from "../config";  

const DefaultInvestmentDetail = () => {
  const { portfolioId } = useParams();  // 從 URL 中獲取 portfolioId
  const [portfolioData, setPortfolioData] = useState(null);  // 儲存投資組合資料
  const navigate = useNavigate();
  const BASE_URL = config.API_URL;


  useEffect(() => {
    console.log('Portfolio ID:', portfolioId);  // Log the portfolioId to verify it is correct

    axios.get(`${BASE_URL}/investment/default-investment-portfolios/${portfolioId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`  // 假設你將 token 存在 localStorage 中
      }
    })    
      .then(response => {
        setPortfolioData(response.data);  // 成功後設置投資組合資料
      })
      .catch(error => {
        console.error('無法獲取投資組合詳細資料:', error);
      });
  }, [portfolioId]);

  if (!portfolioData) {
    return <div>加載中...</div>;
  }

  return (
    <div className="container invback" style={{ padding: 20 }}>
      <h1 className="title">投資組合：{portfolioData.name}</h1>
      <Card title="投資門檻" className="stats-card" style={{ marginBottom: 20 }}>
        <Statistic
          title="投資門檻"
          value={portfolioData.investment_threshold ? `NT$ ${portfolioData.investment_threshold.toLocaleString()}` : 'N/A'}
        />
      </Card>

      <Card title="投資組合股票" className="stats-card">
        <Row gutter={16}>
          {portfolioData.stocks && portfolioData.stocks.map(stock => (
            <Col span={12} key={stock.stock_symbol}>
              <Statistic
                title={`${stock.stock_name} (${stock.stock_symbol})`}
                value={stock.quantity}
                prefix="數量: "
              />
            </Col>
          ))}
        </Row>
      </Card>

      <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3%' }}>
        <Button type="link" className="back-button" onClick={() => navigate(-1)}>
          返回上頁
        </Button>
        <Button type="link" className="back-button">
          新增至自選投資組合
        </Button>
      </div>
    </div>
  );
};

export default DefaultInvestmentDetail;
