import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Select, Radio, Card, Col, Row, Statistic, Spin, Flex, Form } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { StockRequest } from '../api/request/stockRequest.js';
import { LoadingOutlined } from '@ant-design/icons';
import KBar from './kbar.js';
import '../assets/css/InvestmentModal.css';
import { InvestmentRequest } from '../api/request/investmentRequest.js';

const { Option } = Select;

const StockInfo = ({ id }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddPortfolioModalVisible, setIsAddPortfolioModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('buyAndHold');
  const [customAmount, setCustomAmount] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [portfolioName, setPortfolioName] = useState('');
  const [description, setDescription] = useState('');
  const [formData, setFormData] = useState({});
  const [formattedDate, setFormattedDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [investmentData, setInvestmentData] = useState([]);  // 用來存儲投資組合
  const [stockPrices, setStockPrices] = useState({}); // 儲存每個股票的價格

  const priceColor = formData.change_price < 0 ? '#09CF41' : '#dc3545';
  const changeIcon = formData.change_price < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />;

  const stockPrice = formData.close;
  const buyAndHoldAmount = 100;
  const naiveAmount = 200;

  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      StockRequest.getStock(id)
        .then(response => {
          setFormData(response.data);
          const millisecondsTimestamp = response.data.ts / 1e6;
          const date = new Date(millisecondsTimestamp);
          const getDay = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0') + ' ' +
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0') + ':' +
            String(date.getSeconds()).padStart(2, '0');
          setFormattedDate(getDay);
        })
        .catch((error) => {
          alert(error.message);
        });
      setIsLoading(false);
    };

    fetchStockData();
  }, []);

  const showModal = () => {
    fetchDropdownData();
    setIsModalVisible(true);
  };

  const fetchDropdownData = () => {
    InvestmentRequest.getPortfolios()
      .then(response => {
        const portfolios = response.data.map(item => ({ ...item, key: item.id }));
        portfolios.forEach(portfolio => {
          portfolio.investments.forEach(stock => {
            fetchStockPrice(stock.symbol);  // 自動查詢每個股票的價格和名稱
          });
        });
        setInvestmentData(portfolios);  // 更新投資組合數據
      })
      .catch(error => {
        console.error('無法獲取投資組合:', error);
      });
  }

  // 查詢股票即時價格或收盤價
  const fetchStockPrice = (symbol) => {
    if (!stockPrices[symbol]) {
      InvestmentRequest.getStockPrice(symbol)
        .then(response => {
          if (response.data) {
            setStockPrices(prevPrices => ({
              ...prevPrices,
              [symbol]: {
                price: response.data.price || 0,  // 預設為 0
                name: response.data.name || '未知股票'  // 預設名稱
              }
            }));
          } else {
            console.error(`無法獲取股票 ${symbol} 的資料`);
          }
        })
        .catch(error => {
          console.error(`無法獲取股票 ${symbol} 的價格:`, error);
        });
    }
  };

  // 提交表單時處理的邏輯 (新增投資組合)
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

  const handleAddPortfolioCancel = () => {
    setIsAddPortfolioModalVisible(false);
  };

  const handleAddPortfolioOk = () => {
    form.validateFields()
      .then(values => {
        const newPortfolio = {
          name: values.portfolioName,
          description: values.description,
        };
        InvestmentRequest.createPortfolio(newPortfolio)
          .then(response => {
            if (response.data && response.data.id) {
              setIsAddPortfolioModalVisible(false);
              form.resetFields();
              alert('投資組合新增成功');
              fetchDropdownData();
            } else {
              console.error('無法取得新建投資組合的 ID');
            }
          })
          .catch(error => {
            alert('新增投資組合失敗，請重試。');
          });
      })
      .catch(info => {
        console.log('驗證失敗:', info);
      });
  };

  return (
    <Card className='h-100'>
      <Flex gap="middle" vertical>
        <Spin spinning={isLoading} indicator={<LoadingOutlined spin />} size="large" >
          {formData.name != null ? (
            <>
              <p>最後更新時間 {formattedDate}</p>
              <h2 style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {formData.name} {id}
                <Button
                  type="primary"
                  onClick={showModal}
                  className="ms-auto button2"
                  style={{
                    marginLeft: '10px'
                  }}
                >
                  新增至投資組合
                </Button>
              </h2>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="價格"
                    value={formData.close}
                    precision={2}
                    valueStyle={{ color: priceColor }} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="漲跌幅"
                    value={formData.change_rate}
                    precision={2}
                    valueStyle={{ color: priceColor }}
                    prefix={changeIcon}
                    suffix="%" />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="開盤價" value={formData.open} precision={2} />
                </Col>
                <Col span={6}>
                  <Statistic title="收盤價" value={formData.close} precision={2} />
                </Col>
                <Col span={6}>
                  <Statistic title="最高價" value={formData.high} precision={2} />
                </Col>
                <Col span={6}>
                  <Statistic title="最低價" value={formData.low} precision={2} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="單量" value={formData.volume} precision={2} />
                </Col>
                <Col span={6}>
                  <Statistic title="成交量" value={formData.total_volume} />
                </Col>
              </Row>
              <div className="stock-chart">
                <KBar id={id}></KBar>
              </div>
              <Modal title={<h3>{formData.name} {id}</h3>} open={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="送出"
                okButtonProps={{
                  className: "ms-auto button2"
                }}>
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
                        style={{ width: '150px', marginRight: '10px' }} />
                      <span>現時股價：{formData.close.toFixed(2)} 總花費: {(selectedOption === 'custom' || selectedOption === 'buyAndHold' || selectedOption === 'naive') && totalPrice.toFixed(2)} 元</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px' }}>
                    <Select
                      style={{ width: '200px', marginRight: '10px' }}
                      placeholder="選擇投資組合"
                      onChange={value => console.log(`選擇的投資組合 ID: ${value}`)}
                    >
                      {investmentData.map(portfolio => (
                        <Option key={portfolio.id} value={portfolio.id}>
                          {portfolio.name}
                        </Option>
                      ))}
                    </Select>
                  <Button type="primary" className="ms-auto button2" onClick={handleAddPortfolioClick}>新增投資組合</Button>
                </div>
              </div>
            </Modal>
          <Modal
            title="新增投資組合"
            open={isAddPortfolioModalVisible}
            onOk={handleAddPortfolioOk}
            onCancel={handleAddPortfolioCancel}
          >
            <Form form={form} layout="vertical">
              <Form.Item name="portfolioName" label="投資組合名稱" rules={[{ required: true, message: '請輸入投資組合名稱' }]}>
                <Input placeholder="請輸入投資組合名稱" />
              </Form.Item>

              <Form.Item name="description" label="投資組合描述" rules={[{ required: true, message: '請輸入投資組合描述' }]}>
                <Input placeholder="請輸入投資組合描述" />
              </Form.Item>
            </Form>
          </Modal>
        </>
        ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>無法獲取股票信息</p>
        </div>
          )}
      </Spin >
    </Flex>
    </Card >
  );
};

export default StockInfo;
