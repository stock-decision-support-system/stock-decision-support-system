import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, message, Select } from 'antd';

const { Option } = Select;

const PlaceOrder = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [action, setAction] = useState('Buy'); // 默認為買單
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // 假設你已經有 JWT token 驗證機制

    try {
      const response = await axios.post(
        'http://localhost:8000/api/place-odd-lot-order/',
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

  return (
    <div>
      <h1>下單零股</h1>
      <Form layout="vertical" onFinish={placeOrder}>
        <Form.Item label="股票代號" required>
          <Input
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            placeholder="請輸入股票代號"
          />
        </Form.Item>
        <Form.Item label="下單價格" required>
          <Input
            type="number"
            value={orderPrice}
            onChange={(e) => setOrderPrice(e.target.value)}
            placeholder="請輸入下單價格"
          />
        </Form.Item>
        <Form.Item label="下單股數" required>
          <Input
            type="number"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            placeholder="請輸入下單股數"
          />
        </Form.Item>
        <Form.Item label="操作類型" required>
          <Select value={action} onChange={setAction}>
            <Option value="Buy">買入</Option>
            <Option value="Sell">賣出</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            下單
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PlaceOrder;
