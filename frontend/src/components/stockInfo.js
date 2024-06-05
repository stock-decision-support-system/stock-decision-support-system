import React, { useState } from 'react';
import { Button, Modal, Input, Select, Radio } from 'antd';
import fakeChart from '../assets/images/chart.png';

const { Option } = Select;

const StockInfo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddPortfolioModalVisible, setIsAddPortfolioModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('buyAndHold');
  const [customAmount, setCustomAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [portfolioName, setPortfolioName] = useState('');

  const stockPrice = 841.00;
  const buyAndHoldAmount = 100; // 假设的股数
  const naiveAmount = 200; // 假设的股数

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
    // 选择 buyAndHold 或 naive 时更新总花费
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
      <h2>
        台積電 2330
        <Button
          type="primary"
          onClick={showModal}
          style={{ marginLeft: '10px', backgroundColor: '#CD4444', borderColor: '#CD4444' }}
        >
          新增至投資組合
        </Button>
      </h2>
      <div className="stock-price">
        <span className="price">{stockPrice}</span>
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

      <Modal title={<h3>台積電 2330</h3>} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
