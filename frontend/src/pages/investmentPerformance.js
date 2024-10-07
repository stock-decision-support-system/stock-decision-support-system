import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Row, Col, Card, Statistic } from 'antd';
import '../assets/css/investmentPerformance.css';
import { RightOutlined } from '@ant-design/icons';
import { InvestmentRequest } from '../api/request/investmentRequest.js';
import Performance from '../components/performance.js';

const InvestmentPerformance = () => {
  const { id } = useParams();
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState('buyAndHold');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      InvestmentRequest.getPortfolioDetail(id)
        .then(response => {
          setPortfolioData(response.data);
        })
        .catch(error => {
          alert(error.message);
        });
      setLoading(false);
    };

    fetchPortfolioData();
  }, []);

  const handleAlgorithmChange = (algo) => {
    setAlgorithm(algo);
  };

  const lastDataPoint = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1] : null;
  const secondLastDataPoint = portfolioData.length > 1 ? portfolioData[portfolioData.length - 2] : null;
  const dailyChange = lastDataPoint && secondLastDataPoint ? ((lastDataPoint.value - secondLastDataPoint.value) / secondLastDataPoint.value * 100).toFixed(2) : 0;
  const totalReturn = lastDataPoint ? ((lastDataPoint.value / portfolioData[0].value - 1) * 100).toFixed(2) : 0;

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
      <Card title="投資績效數據" className="stats-card" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="總回報率"
              value={portfolioData.totalReturn ? portfolioData.totalReturn : 'N/A'}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="年化回報率"
              value={portfolioData.annualReturn ? portfolioData.annualReturn : 'N/A'}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="最大回撤"
              value={portfolioData.maxDrawdown ? portfolioData.maxDrawdown : 'N/A'}
              suffix="%"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="波動率"
              value={portfolioData.volatility ? portfolioData.volatility : 'N/A'}
              suffix="%"
            />
          </Col>
        </Row>
        <div style={{ display: 'flex', justifyContent: 'end', marginTop: '2.5%' }}>
          <Button type="primary" className="details-button">
            查看詳細數據
          </Button>
        </div>
      </Card>
      <Card title="投資組合項目" className="stats-card" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          {portfolioData.investments.map(stock => (
            <Col span={12} key={stock.symbol}>
              <Statistic
                title={`${stock.name} (${stock.symbol})`}
                value={stock.totalValue ? stock.totalValue.toFixed(2) : 'N/A'}
                prefix="總價值: "
                suffix={
                  stock.change ? (
                    <span style={{ color: 'red' }}>▲ {stock.change.toFixed(2)}</span>
                  ) : 'N/A'
                }
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
          新增至自選投資組合 <RightOutlined className='icon-right' />
        </Button>
      </div>
    </div>
  );
};

export default InvestmentPerformance;
