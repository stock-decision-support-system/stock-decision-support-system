import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Input, Button, message, AutoComplete } from 'antd';
import { config } from '../config';

const BASE_URL = config.API_URL;

const PlaceOrder = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [action, setAction] = useState('Buy'); // 默認為買單
  const [loading, setLoading] = useState(false);
  const [stockOptions, setStockOptions] = useState([]); // 用於存儲股票選項

  // 獲取所有股票資料
  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/investment/stocks/`);
      if (response.data.status === 'success') {
        setStockOptions(response.data.data);
      } else {
        message.error('獲取股票資料失敗');
      }
    } catch (error) {
      console.error('獲取股票資料失敗:', error);
      message.error('獲取股票資料失敗，請檢查網路連線');
    }
  };

  // 當組件掛載時獲取股票資料
  useEffect(() => {
    fetchStocks();
  }, []);

  const placeOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // 假設你已經有 JWT token 驗證機制

    try {
      const response = await axios.post(
        `${BASE_URL}/api/place-odd-lot-order/`,
        {
          stock_symbol: stockSymbol,
          order_quantity: orderQuantity,
          order_price: orderPrice,
          action: action,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'success') {
        message.success('下單成功!');
      } else {
        message.error(response.data.message || '下單失敗');
      }
    } catch (error) {
      console.error('下單失敗:', error);
      message.error('下單失敗，請檢查輸入數據和網路連線');
    } finally {
      setLoading(false);
    }
  };

  // 處理股票搜索選項
  const handleSearch = (value) => {
    const filteredStocks = stockOptions.filter(stock =>
      stock.symbol.includes(value) || stock.name.includes(value)
    );
    return filteredStocks.map(stock => ({
      value: stock.symbol,
      label: `${stock.symbol} - ${stock.name}`,
    }));
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
              options={handleSearch(stockSymbol)} // 根據輸入值提供選項
              value={stockSymbol}
              onChange={setStockSymbol}
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
              onChange={(e) => setOrderPrice(e.target.value)}
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
                type={action === 'Buy' ? 'primary' : 'default'}
                onClick={() => setAction('Buy')}
                style={{
                  width: '48%',
                  backgroundColor: action === 'Buy' ? 'red' : '', // 當選擇為"買入"時背景為紅色
                }}
              >
                買入
              </Button>
              <Button
                type={action === 'Sell' ? 'primary' : 'default'}
                onClick={() => setAction('Sell')}
                style={{
                  width: '48%',
                  backgroundColor: action === 'Sell' ? 'green' : '',
                }}
              >
                賣出
              </Button>
            </div>
          </Form.Item>
          <Form.Item>
            <Button className='button2' htmlType="submit" loading={loading} style={{ width: '100%' }}>
              下單
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default PlaceOrder;
