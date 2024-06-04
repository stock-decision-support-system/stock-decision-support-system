import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, Button, Row, Col, Card, Descriptions, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import '../assets/css/investmentPerformance.css';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';


const { Option } = Select;

const data = {
  taiwan50: {
    buyAndHold: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 105 },
      { date: '2023-01-03', value: 110 },
      { date: '2023-01-04', value: 115 },
      { date: '2023-01-05', value: 120 },
    ],
    naive: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 102 },
      { date: '2023-01-03', value: 104 },
      { date: '2023-01-04', value: 106 },
      { date: '2023-01-05', value: 108 },
    ],
  },
  techSector: {
    buyAndHold: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 108 },
      { date: '2023-01-03', value: 116 },
      { date: '2023-01-04', value: 124 },
      { date: '2023-01-05', value: 132 },
    ],
    naive: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 104 },
      { date: '2023-01-03', value: 108 },
      { date: '2023-01-04', value: 112 },
      { date: '2023-01-05', value: 116 },
    ],
  },
  top10: {
    buyAndHold: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 107 },
      { date: '2023-01-03', value: 114 },
      { date: '2023-01-04', value: 121 },
      { date: '2023-01-05', value: 128 },
    ],
    naive: [
      { date: '2023-01-01', value: 100 },
      { date: '2023-01-02', value: 103 },
      { date: '2023-01-03', value: 106 },
      { date: '2023-01-04', value: 109 },
      { date: '2023-01-05', value: 112 },
    ],
  },
};

const stats = {
  taiwan50: {
    totalReturn: 20,
    annualReturn: 4.8,
    maxDrawdown: 10,
    volatility: 5,
    startDate: '2023-01-01',
    endDate: '2023-05-01'
  },
  techSector: {
    totalReturn: 32,
    annualReturn: 7.5,
    maxDrawdown: 8,
    volatility: 6,
    startDate: '2023-01-01',
    endDate: '2023-05-01'
  },
  top10: {
    totalReturn: 28,
    annualReturn: 6.2,
    maxDrawdown: 9,
    volatility: 5.5,
    startDate: '2023-01-01',
    endDate: '2023-05-01'
  },
};

const tooltips = {
  totalReturn: "總回報率：投資期內的總收益率。",
  annualReturn: "年化回報率：年均收益率，考慮了複利效果。",
  maxDrawdown: "最大回撤：投資期內最大資金回撤比例。",
  volatility: "波動率：投資期內收益的波動程度。"
};

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
  const [selectedCategory, setSelectedCategory] = useState('taiwan50');
  const [algorithm, setAlgorithm] = useState('buyAndHold');
  const navigate = useNavigate();

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleAlgorithmChange = (algo) => {
    setAlgorithm(algo);
  };

  const currentData = data[selectedCategory][algorithm];
  const lastDataPoint = currentData[currentData.length - 1];
  const secondLastDataPoint = currentData[currentData.length - 2];
  const dailyChange = ((lastDataPoint.value - secondLastDataPoint.value) / secondLastDataPoint.value * 100).toFixed(2);
  const totalReturn = ((lastDataPoint.value / currentData[0].value - 1) * 100).toFixed(2);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div className="container invback" style={{ padding: 20 }}>
      <h1 className="title">台灣前50大公司</h1>
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
          <Descriptions.Item label={<span>總回報率<Tooltip title={tooltips.totalReturn}><QuestionCircleOutlined style={{ marginLeft: 8 }}/></Tooltip></span>}>
            {stats[selectedCategory].totalReturn}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>年化回報率<Tooltip title={tooltips.annualReturn}><QuestionCircleOutlined style={{ marginLeft: 8 }}/></Tooltip></span>}>
            {stats[selectedCategory].annualReturn}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>最大回撤<Tooltip title={tooltips.maxDrawdown}><QuestionCircleOutlined style={{ marginLeft: 8 }}/></Tooltip></span>}>
            {stats[selectedCategory].maxDrawdown}%
          </Descriptions.Item>
          <Descriptions.Item label={<span>波動率<Tooltip title={tooltips.volatility}><QuestionCircleOutlined style={{ marginLeft: 8 }}/></Tooltip></span>}>
            {stats[selectedCategory].volatility}%
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3%' }}>
  <Button type="link" className="back-button" onClick={() => navigate(-1)}>
    返回上頁
  </Button>
  <Button type="primary" className="details-button">
    查看詳細數據
  </Button>
</div>
    </div>
  );
};

export default InvestmentPerformance;
