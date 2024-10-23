import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Card, Statistic, message, Spin, Typography, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons'; // 引入 info 圖標
import axios from 'axios';
import { config } from "../config";  
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'; // 引入 Recharts

const DefaultInvestmentDetail = () => {
  const { portfolioId } = useParams();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [pnl, setPnl] = useState(0);
  const [roi, setRoi] = useState(0);
  const navigate = useNavigate();
  const BASE_URL = config.API_URL;

  useEffect(() => {
    axios.get(`${BASE_URL}/investment/default-investment-portfolios/${portfolioId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      setPortfolioData(response.data);
    })
    .catch(error => {
      console.error('無法獲取投資組合詳細資料:', error);
    });

    axios.post(`${BASE_URL}/investment/portfolio-performance/${portfolioId}/`, {})
      .then(response => {
        const { performance, pnl, roi } = response.data;
        const chartData = Object.keys(performance).map(month => ({
          month, 
          value: performance[month]
        }));
        setChartData(chartData);
        setPnl(pnl);
        setRoi(roi);
        setLoading(false);
      })
      .catch(error => {
        console.error('無法獲取投資組合績效數據:', error);
        setLoading(false);
      });
  }, [portfolioId]);

  if (!portfolioData) {
    return <div>加載中...</div>;
  }

  return (
    <div className="container invback" style={{ padding: 20, marginTop: '55%' }}>
      <h1 className="title">投資組合：{portfolioData.name}</h1>

      <Card title="投資門檻" className="stats-card" style={{ marginBottom: 20 }}>
        <Statistic
          title="投資門檻"
          value={portfolioData.investment_threshold ? `NT$ ${portfolioData.investment_threshold.toLocaleString()}` : 'N/A'}
        />
      </Card>

      <Card title="損益與投報率(2024/1/1至今)" className="stats-card" style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="損益 (PnL)"
              value={pnl ? `NT$ ${pnl.toLocaleString()}` : 'N/A'}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title={
                <span>
                  投報率 (ROI) 
                  <Tooltip title="投報率 (ROI) 是衡量投資獲利相對於成本的百分比。">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              value={roi ? `${roi.toFixed(2)}%` : 'N/A'}
            />
          </Col>
        </Row>
      </Card>

      <Card title="投資組合股票" className="stats-card">
        <Row gutter={16}>
          {portfolioData.stocks && portfolioData.stocks.map(stock => (
            <Col span={12} key={stock.stock_symbol}>
              <Statistic
                title={`${stock.stock_name} (${stock.stock_symbol})`}
                value={stock.quantity}
                prefix="股數: "
              />
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="投資績效圖表" className="stats-card" style={{ marginTop: 20 }}>
        <Spin spinning={loading}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Typography.Text>暫無圖表數據</Typography.Text>
          )}
        </Spin>
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
