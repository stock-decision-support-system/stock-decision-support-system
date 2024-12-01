import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, message, AutoComplete } from 'antd';
import { config } from '../config';

const BASE_URL = config.API_URL;

const PlaceOrder = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [action, setAction] = useState('買入'); // 預設為買單
  const [loading, setLoading] = useState(false);
  const [stockOptions, setStockOptions] = useState([]); // 儲存股票選項

  // 獲取股票資料
  const fetchStocks = async () => {
    try {
      console.log('Fetching stocks...');
      const response = await axios.get(`${BASE_URL}/investment/stocks/`);
      console.log('Stock fetch response:', response.data);
      if (response.data.status === 'success') {
        setStockOptions(response.data.data);
      } else {
        message.error('無法獲取股票資料');
      }
    } catch (error) {
      console.error('獲取股票資料失敗:', error);
      message.error('無法獲取股票資料，請檢查網路連線');
    }
  };

  // 獲取選中股票的即時價格
  const fetchStockPrice = async (symbol) => {
    try {
      console.log(`Fetching stock price for symbol: ${symbol}`);
      const response = await axios.get(`${BASE_URL}/investment/stock_price/${symbol}/`);
      console.log('Stock price fetch response:', response.data);
      if (response.data.status === 'success') {
        const price = response.data.data.price;
        setOrderPrice(price); // 自動填入價格
      } else {
        message.error(response.data.message || '無法獲取股票價格');
      }
    } catch (error) {
      console.error('獲取股票價格失敗:', error);
      if (error.response) {
        console.log('Stock price fetch error response:', error.response.data);
        if (error.response.status === 404) {
          message.error('無法找到對應的股票資料，請確認股票代號是否正確');
        } else {
          message.error(`無法獲取股票價格，錯誤代碼: ${error.response.status}`);
        }
      } else {
        message.error('無法獲取股票價格，請檢查網路連線');
      }
    }
  };

  // 組件掛載時執行
  useEffect(() => {
    fetchStocks();
  }, []);

  // 提交訂單
  const placeOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // 假設已經有 JWT token 驗證機制
  
    try {
      console.log('Placing order...');
      console.log('Order data:', {
        stock_symbol: stockSymbol,
        order_quantity: parseInt(orderQuantity, 10), // 確保為整數
        order_price: parseFloat(orderPrice), // 確保為浮點數
        action: action === '買入' ? 'Buy' : 'Sell', // 將繁體中文轉換為英文字串
      });
  
      const response = await axios.post(
        `${BASE_URL}/api/place-odd-lot-order/`,
        {
          stock_symbol: stockSymbol,
          order_quantity: parseInt(orderQuantity, 10), // 整數
          order_price: parseFloat(orderPrice), // 浮點數
          action: action === '買入' ? 'Buy' : 'Sell', // 轉換為英文字串
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Order response:', response.data);
      if (response.data.status === 'success') {
        message.success('下單成功！');
      } else {
        message.error(response.data.message || '下單失敗');
      }
    } catch (error) {
      console.error('下單失敗:', error);
      if (error.response) {
        console.log('Order error response:', error.response.data);
        message.error(`下單失敗：${error.response.data.message || '伺服器回應錯誤'}`);
      } else {
        message.error('下單失敗，請檢查網路連線');
      }
    } finally {
      setLoading(false);
    }
  };
  

  // 處理股票搜尋選項
  const handleSearch = (value) => {
    const filteredStocks = stockOptions.filter((stock) =>
      stock.symbol.includes(value) || stock.name.includes(value)
    );
    return filteredStocks.map((stock) => ({
      value: stock.symbol,
      label: `${stock.symbol} - ${stock.name}`,
    }));
  };

  // 股票選擇後的處理邏輯
  const onStockSelect = (value) => {
    console.log(`Selected stock symbol: ${value}`);
    setStockSymbol(value); // 更新選擇的股票代號
    fetchStockPrice(value); // 獲取即時價格
  };

  return (
    <div className="User kv w-100 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div
        className="form-container w-50"
        style={{
          padding: '20px',
          backgroundColor: 'rgba(232, 180, 188, 0.65)',
          borderRadius: '10px',
        }}
      >
        <h1 style={{ fontSize: '25px', textAlign: 'center', marginBottom: '20px' }}>下單零股</h1>
        <Form layout="vertical" onFinish={placeOrder}>
          <Form.Item label="股票代號" required>
            <AutoComplete
              options={handleSearch(stockSymbol)} // 根據輸入提供選項
              value={stockSymbol}
              onChange={setStockSymbol}
              onSelect={onStockSelect} // 選中後觸發
              placeholder="請輸入股票代號"
              style={{ width: '100%' }}
            >
              <Input />
            </AutoComplete>
          </Form.Item>
          <Form.Item label="下單價格" required>
            <Input
              type="number"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)} // 可手動修改價格
              placeholder="請輸入下單價格"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="下單股數" required>
            <Input
              type="number"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
              placeholder="請輸入下單股數"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="操作類型" required>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type={action === '買入' ? 'primary' : 'default'}
                onClick={() => setAction('買入')}
                style={{
                  width: '48%',
                  backgroundColor: action === '買入' ? 'red' : '', // 選擇為"買入"時背景變紅色
                }}
              >
                買入
              </Button>
              <Button
                type={action === '賣出' ? 'primary' : 'default'}
                onClick={() => setAction('賣出')}
                style={{
                  width: '48%',
                  backgroundColor: action === '賣出' ? 'green' : '',
                }}
              >
                賣出
              </Button>
            </div>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={loading} style={{ width: '100%' }}>
              下單
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default PlaceOrder;
