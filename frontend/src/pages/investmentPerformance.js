import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, Button, Row, Col, Card, Descriptions, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import '../assets/css/investmentPerformance.css';
import { ArrowUpOutlined, ArrowDownOutlined, RightOutlined } from '@ant-design/icons';

const { Option } = Select;

const Performance = ({ value, percentage }) => {
  const isGain = value >= 0;
  return (
    <span className={isGain ? 'gain' : 'loss'}>
      {isGain ? <ArrowUpOutlined className="arrow-up" /> : <ArrowDownOutlined className="arrow-down" />} 
      {Math.abs(value).toFixed(2)} ({Math.abs(percentage).toFixed(2)}%)
    </span>
  );
};

const InvestmentPerformance = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('taiwan50');
  const [algorithm, setAlgorithm] = useState('buyAndHold');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/portfolios/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPortfolioData(response.data);
      } catch (err) {
        setError('無法獲取投資組合詳細信息');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  if (loading) {
    return <div>加載中...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!portfolioData || !portfolioData.investments || portfolioData.investments.length === 0) {
    return <div>無法加載投資組合數據</div>;
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleAlgorithmChange = (algo) => {
    setAlgorithm(algo);
  };

  const currentData = portfolioData.investments || []; // 使用後端數據並增加防錯處理
  const lastDataPoint = currentData.length > 0 ? currentData[currentData.length - 1] : null;
  const secondLastDataPoint = currentData.length > 1 ? currentData[currentData.length - 2] : null;
  const dailyChange = lastDataPoint && secondLastDataPoint ? ((lastDataPoint.value - secondLastDataPoint.value) / secondLastDataPoint.value * 100).toFixed(2) : 0;
  const totalReturn = lastDataPoint ? ((lastDataPoint.value / currentData[0].value - 1) * 100).toFixed(2) : 0;

  return (
    <div className="container invback" style={{ padding: 20 }}>
      <h1 className="title">投資組合：{portfolioData.name}</h1>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12} className='d-flex justify-content-center'>
          <Button className={algorithm === 'buyAndHold' ? 'selected-button' : 'unselected-button'}
                  onClick={() => handleAlgorithmChange('buyAndHold')}
                  style={{ width: '80%' }}>
            Buy and Hold
          </Button>
        </Col>
        <Col span={12} className='w-100' justify='center'>
          <Button className={algorithm === 'naive' ? 'selected-button' : 'unselected-button'}
                  onClick={() => handleAlgorithmChange('naive')}
                  style={{ width: '80%' }}>
            Naive
          </Button>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginBottom: 20, textAlign: 'center' }}>
        <Col span={12}>
          <h3>當日增減: <Performance value={dailyChange} percentage={dailyChange} /></h3>
        </Col>
        <Col span={12}>
          <h3>總回報率: <Performance value={totalReturn} percentage={totalReturn} /></h3>
        </Col>
      </Row>
      <ResponsiveContainer width="95%" height={350}>
        <LineChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <Card title="投資績效數據" className="stats-card" style={{ marginTop: 20 }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label={<span>總回報率</span>}>
            {portfolioData.totalReturn}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>年化回報率</span>}>
            {portfolioData.annualReturn}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>最大回撤</span>}>
            {portfolioData.maxDrawdown}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>波動率</span>}>
            {portfolioData.volatility}%
          </Descriptions.Item>
        </Descriptions>
        <div className='' style={{display: 'flex', justifyContent: 'end'}}>
        <Button type="primary" className="details-button" style={{marginTop:'2.5%'}}>
          查看詳細數據
        </Button>
        </div>
      </Card>
      <Card title="投資組合項目" className="stats-card" style={{ marginTop: 20 }}>
        <Descriptions bordered column={1}>
          {portfolioData.investments.map(stock => (
            <Descriptions.Item
              key={stock.symbol}
              label={<span>{stock.name} ({stock.symbol})</span>}
              contentStyle={{ textAlign: 'right' }}
            >
              總價值: {stock.totalValue ? stock.totalValue.toFixed(2) : 'N/A'} <span style={{ color: 'red' }}>▲ {stock.change ? stock.change.toFixed(2) : 'N/A'}</span>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
      <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3%' }}>
        <Button type="link" className="back-button" onClick={() => navigate(-1)}>
          返回上頁
        </Button>
        <Button type="link" className="back-button">
          新增至自選投資組合 <RightOutlined className='icon-right' />
        </Button>
      </div>
    </div>
  );
};

export default InvestmentPerformance;
