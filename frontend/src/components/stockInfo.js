import React, { useState } from 'react';
import { Button, Modal, Input, Select, Radio, Card, Col, Row, Statistic } from 'antd';
import fakeChart from '../assets/images/chart.png';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';

const { Option } = Select;

const StockInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddPortfolioModalVisible, setIsAddPortfolioModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('buyAndHold');
  const [customAmount, setCustomAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [portfolioName, setPortfolioName] = useState('');
  const [formData, setFormData] = useState({
    code: "2330",
    exchange: "Taiwan Stock Exchange",
    ts: new Date(2024, 8, 14).getTime(),
    open_price: 17.85,
    high_price: 17.90,
    low_price: 17.75,
    close_price: 17.80,
    change_price: -8.00,
    change_rate: -0.91,
    volume: 6748,
    total_volume: 34094,
    pe_ratio: 26.24,
    pe_ratio_industry_avg: 81.80,
  });

  const { code, open_price, high_price, low_price, close_price, volume, total_volume, pe_ratio, pe_ratio_industry_avg } = formData;

  const priceColor = formData.change_price < 0 ? '#09CF41' : '#dc3545';
  const changeIcon = formData.change_price < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />;

  const stockPrice = 841.00;
  const buyAndHoldAmount = 100;
  const naiveAmount = 200;

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOptionChange = e => {
    setSelectedOption(e.target.value);
    if (e.target.value === 'buyAndHold') {
      setTotalPrice(buyAndHoldAmount * stockPrice);
    } else if (e.target.value === 'naive') {
      setTotalPrice(naiveAmount * stockPrice);
    }
  };

  const handleCustomAmountChange = e => {
    const amount = e.target.value;
    setCustomAmount(amount);
    setTotalPrice(amount * stockPrice);
  };

  const handleAddPortfolioClick = () => {
    setIsAddPortfolioModalVisible(true);
  };

  const handleAddPortfolioOk = () => {
    console.log('New portfolio name:', portfolioName);
    setIsAddPortfolioModalVisible(false);
    setPortfolioName('');
  };

  const handleAddPortfolioCancel = () => {
    setIsAddPortfolioModalVisible(false);
  };

  return (
    <div className="stock-info">
    <p>最後更新時間 {new Date(formData.ts).toLocaleDateString()}</p>
    <h2>
        台積電 {code}
        <Button
          type="primary"
          onClick={showModal}
          style={{ marginLeft: '10px', backgroundColor: '#CD4444', borderColor: '#CD4444' }}
        >
          新增至投資組合
        </Button>
      </h2>

      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="價格"
            value={close_price}
            precision={2}
            valueStyle={{ color: priceColor }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="漲跌幅"
            value={formData.change_rate}
            precision={2}
            valueStyle={{ color: priceColor }}
            prefix={changeIcon}
            suffix="%"
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={5}>
          <Statistic title="開" value={open_price} precision={2} />
        </Col>
        <Col span={5}>
          <Statistic title="收" value={close_price} precision={2} />
        </Col>
        <Col span={5}>
          <Statistic title="高" value={high_price} precision={2} />
        </Col>
        <Col span={5}>
          <Statistic title="低" value={low_price} precision={2} />
        </Col>
        <Col span={4}>
          <Statistic title="量" value={volume} precision={2} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={5}>
          <Statistic title="成交量" value={total_volume.toLocaleString()} />
        </Col>
        <Col span={5}>
          <Statistic title="本益比" value={pe_ratio} precision={2} />
        </Col>
        <Col span={5}>
          <Statistic title="同業平均" value={pe_ratio_industry_avg} precision={2} />
        </Col>
      </Row>
      <div className="stock-chart">
        <img src={fakeChart} alt="Stock Chart" />
      </div>

      <Modal title={<h3>台積電 {code}</h3>} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div>
          <div>
            <Radio.Group onChange={handleOptionChange} value={selectedOption}>
              <Radio value="buyAndHold">Buy and Hold</Radio>
              <Radio value="naive" style={{ marginLeft: '10px' }}>Naive</Radio>
              <Radio value="custom" style={{ marginLeft: '10px' }}>自訂</Radio>
            </Radio.Group>
            <div style={{ marginTop: '10px' }}>
              <Input
                type="number"
                value={selectedOption === 'custom' ? customAmount : (selectedOption === 'buyAndHold' ? buyAndHoldAmount : naiveAmount)}
                onChange={handleCustomAmountChange}
                placeholder="輸入股數"
                style={{ width: '150px', marginRight: '10px' }}
              />
              <span>現時股價：{stockPrice.toFixed(2)} 總花費: {(selectedOption === 'custom' || selectedOption === 'buyAndHold' || selectedOption === 'naive') && totalPrice.toFixed(2)} 元</span>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Select placeholder="選擇投資組合" style={{ width: '200px', marginRight: '10px' }}>
              <Option value="portfolio1">投資組合 1</Option>
              <Option value="portfolio2">投資組合 2</Option>
              <Option value="portfolio3">投資組合 3</Option>
            </Select>
            <Button type="primary" onClick={handleAddPortfolioClick}>新增投資組合</Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="新增投資組合"
        visible={isAddPortfolioModalVisible}
        onOk={handleAddPortfolioOk}
        onCancel={handleAddPortfolioCancel}
      >
        <Input
          value={portfolioName}
          onChange={e => setPortfolioName(e.target.value)}
          placeholder="輸入投資組合名稱"
        />
      </Modal>
    </div>
  );
};

export default StockInfo;
