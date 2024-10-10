import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input } from 'antd';
import axios from 'axios'; // 使用 axios 來發送 API 請求
import { InvestmentRequest } from '../api/request/investmentRequest.js'; // 假設有這個 API

const { Option } = Select;

const DefaultInvestment = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [investmentData, setInvestmentData] = useState([]);  // 用來存儲投資組合
  const [stockOptions, setStockOptions] = useState([]);  // 用於儲存股票選項
  const [selectedStocks, setSelectedStocks] = useState([]);  // 用於儲存選擇的股票
  const [stockQuantities, setStockQuantities] = useState({});  // 儲存每個股票的股數
  const [stockPrices, setStockPrices] = useState({});  // 儲存股票的價格
  const [isModalOpen, setIsModalOpen] = useState(false);  // 使用新的 `open` 屬性
  const [form] = Form.useForm();

  // 檢查是否是管理員
  useEffect(() => {
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const isSuperuser = localStorage.getItem('is_superuser') === 'true';
    if (isStaff && isSuperuser) {
      setIsAdmin(true);
    }
  }, []);

  // 每次頁面加載時從後端抓取投資組合資料
  useEffect(() => {
    axios.get('http://localhost:8000/investment/default-investment-portfolios/')
      .then(response => {
        setInvestmentData(response.data);  // 成功後將資料設置到狀態中
      })
      .catch(error => {
        console.error('無法獲取投資組合資料:', error);
      });
  }, []);  // 空依賴陣列，確保只在頁面初次加載時執行

  // 獲取股票選項
  useEffect(() => {
    InvestmentRequest.getAllStocks()
      .then(response => {
        setStockOptions(response.data);  // 成功後設置股票選項
      })
      .catch(error => {
        console.error('無法獲取股票列表:', error);
      });
  }, []);

  const handleAddPortfolio = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const newPortfolio = {
          name: values.portfolioName,  // 投資組合名稱
          stocks: selectedStocks.map(stockSymbol => ({
            stock_symbol: stockSymbol,
            stock_name: stockOptions.find(stock => stock.symbol === stockSymbol)?.name || '',
            quantity: stockQuantities[stockSymbol] || 1,  // 使用者設定的股數，若無則預設為 1
          })),
          investment_threshold: calculateInvestmentThreshold(), // 計算投資門檻
        };

        console.log('即將發送至後端的數據:', newPortfolio);

        axios.post('http://localhost:8000/investment/default-investment-portfolios/', newPortfolio)
          .then(response => {
            setInvestmentData([...investmentData, response.data]);  // 新增成功後將資料添加到表格
            setIsModalOpen(false);
            form.resetFields();
            setSelectedStocks([]);
            setStockQuantities({});
            setStockPrices({});
          })
          .catch(error => {
            console.error('新增投資組合失敗:', error.response?.data || error.message);
          });
      })
      .catch(error => {
        console.error('表單驗證失敗:', error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedStocks([]);
    setStockQuantities({});
    setStockPrices({});
  };

  const handleStocksChange = (value) => {
    setSelectedStocks(value);

    // 查詢所選股票的即時價格或收盤價
    value.forEach(stockSymbol => {
      if (!stockPrices[stockSymbol]) {  // 如果價格還未查詢過，才發送請求
        InvestmentRequest.getStockPrice(stockSymbol)
          .then(response => {
            setStockPrices(prevPrices => ({
              ...prevPrices,
              [stockSymbol]: response.data.price || 0,
            }));
          })
          .catch(error => {
            console.error(`無法獲取股票 ${stockSymbol} 的價格:`, error);
          });
      }
    });
  };

  const handleQuantityChange = (stockSymbol, quantity) => {
    setStockQuantities(prevQuantities => ({
      ...prevQuantities,
      [stockSymbol]: quantity,
    }));
  };

  // 計算投資門檻
  const calculateInvestmentThreshold = () => {
    return selectedStocks.reduce((total, stockSymbol) => {
      const price = stockPrices[stockSymbol] || 0;
      const quantity = stockQuantities[stockSymbol] || 1;
      return total + (price * quantity);
    }, 0);
  };

  const handleSetSavingsGoal = (portfolio) => {
    // 設置儲蓄目標的操作邏輯
    console.log(`設置儲蓄目標: ${portfolio.name}，門檻: ${portfolio.investment_threshold}`);
    // 這裡可以加入額外邏輯來處理儲蓄目標
  };

  const columns = [
    {
      title: '投資組合',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '投資門檻 (NT$)',
      key: 'investment_threshold',
      render: (text, record) => `NT$ ${record.investment_threshold.toLocaleString()}`,
    },
    {
      title: '儲蓄目標',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => handleSetSavingsGoal(record)}>
          設定儲蓄目標
        </Button>
      ),
    },
  ];

  return (
    <div className='container'>
      <h1 className="title">投資組合總覽</h1>

      {isAdmin && (
        <Button type="primary" onClick={handleAddPortfolio} style={{ marginBottom: '20px' }}>
          新增預設投資組合
        </Button>
      )}

      <Table columns={columns} dataSource={investmentData} rowKey="id" />

      <Modal
        title="新增投資組合"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="確認"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="portfolioName"
            label="投資組合名稱"
            rules={[{ required: true, message: '請輸入投資組合名稱' }]}
          >
            <Input placeholder="請輸入投資組合名稱" />
          </Form.Item>
          <Form.Item
            name="stocks"
            label="選擇股票"
            rules={[{ required: true, message: '請選擇至少一支股票' }]}
          >
            <Select
              mode="multiple"
              placeholder="選擇股票"
              onChange={handleStocksChange}
              style={{ width: '100%' }}
            >
              {stockOptions.map(stock => (
                <Option key={stock.symbol} value={stock.symbol}>
                  {stock.name} ({stock.symbol})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 根據選擇的股票顯示股數輸入框 */}
          {selectedStocks.map(stockSymbol => (
            <Form.Item
              key={stockSymbol}
              label={`${stockSymbol} 股數`}
            >
              <Input
                type="number"
                defaultValue={1}
                onChange={(e) => handleQuantityChange(stockSymbol, e.target.value)}
                min={1}
                placeholder="輸入股數"
              />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default DefaultInvestment;
