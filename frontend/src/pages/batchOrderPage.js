import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 使用 useNavigate 來進行跳轉
import { Select, Button, Table, InputNumber, message } from 'antd';
import { config } from '../config';

const BASE_URL = config.API_URL;
const { Option } = Select;

const BatchOrderPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [stockOrders, setStockOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // 使用 useNavigate 來跳轉頁面

  // 獲取預設投資組合
  useEffect(() => {
    axios
      .get(`${BASE_URL}/investment/default-investment-portfolios/`)
      .then((response) => {
        setPortfolios(response.data);
      })
      .catch((error) => {
        console.error('無法獲取投資組合資料:', error);
        message.error('無法獲取投資組合資料');
      });
  }, []);

  // 當選取的投資組合改變時，獲取投資組合的股票資料
  const handlePortfolioChange = (portfolioId) => {
    axios
      .get(`${BASE_URL}/investment/default-investment-portfolios/${portfolioId}/`)
      .then((response) => {
        const portfolio = response.data;
        const stocks = portfolio.stocks || [];

        setSelectedPortfolio(portfolio);
        setStocks(stocks);
        setStockOrders(
          stocks.map((stock) => ({
            symbol: stock.stock_symbol,
            quantity: stock.quantity || 1,
            price: stock.price || 0,
            action: 'Buy',
          }))
        );
      })
      .catch((error) => {
        console.error('無法獲取投資組合股票資料:', error);
        message.error('無法獲取投資組合股票資料');
      });
  };

  const handlePlaceOrders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('尚未登入或缺少驗證 token');
      return;
    }

    setLoading(true); // 開始加載狀態

    axios
      .post(
        `${BASE_URL}/api/place-odd-lot-orders/`,
        {
          stock_symbols: stockOrders.map((order) => order.symbol),
          order_quantities: stockOrders.map((order) => order.quantity),
          order_prices: stockOrders.map((order) => order.price),
          actions: stockOrders.map((order) => order.action),
          price_types: stockOrders.map(() => 'LMT'),
          order_types: stockOrders.map(() => 'ROD'),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        message.success('批次下單成功!');
        navigate('/orderManagement/'); // 跳轉到 /orderManagement/
      })
      .catch((error) => {
        console.error('批次下單失敗:', error.response?.data || error.message);
        message.error('批次下單失敗');
      })
      .finally(() => {
        setLoading(false); // 結束加載狀態
      });
  };

  // 更新股票的下單數量、價格和操作(買/賣)
  const handleOrderChange = (symbol, field, value) => {
    setStockOrders(
      stockOrders.map((order) => {
        if (order.symbol === symbol) {
          return { ...order, [field]: value };
        }
        return order;
      })
    );
  };

  const columns = [
    {
      title: '股票代號',
      dataIndex: 'stock_symbol',
      key: 'stock_symbol',
    },
    {
      title: '股票名稱',
      dataIndex: 'stock_name',
      key: 'stock_name',
    },
    {
      title: '下單數量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => (
        <InputNumber
          min={1}
          defaultValue={1}
          onChange={(value) => handleOrderChange(record.symbol, 'quantity', value)}
        />
      ),
    },
    {
      title: '下單價格',
      dataIndex: 'price',
      key: 'price',
      render: (text, record) => (
        <InputNumber
          min={0}
          step={0.01}
          value={stockOrders.find((order) => order.symbol === record.stock_symbol)?.price || 0}
          onChange={(value) => handleOrderChange(record.stock_symbol, 'price', value)}
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Select
          defaultValue="Buy"
          onChange={(value) => handleOrderChange(record.symbol, 'action', value)}
        >
          <Option value="Buy">買</Option>
          <Option value="Sell">賣</Option>
        </Select>
      ),
    },
  ];

  return (
    <div className="container kv User" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div
        className=" w-50"
        style={{
          padding: '20px',
          backgroundColor: 'rgba(232, 180, 188, 0.85)',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ fontSize: '25px', textAlign: 'center', marginBottom: '20px' }}>批次下單零股</h2>
        <Select
          placeholder="選擇投資組合"
          onChange={handlePortfolioChange}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          {portfolios.map((portfolio) => (
            <Option key={portfolio.id} value={portfolio.id}>
              {portfolio.name}
            </Option>
          ))}
        </Select>

        <div className="" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <Table
            columns={columns}
            dataSource={stocks.length ? stocks : []}
            rowKey="symbol"
            pagination={false}
          />
        </div>

        <Button
          className='button2'
          onClick={handlePlaceOrders}
          loading={loading}
          disabled={stocks.length === 0}
          style={{ width: '100%', marginTop: '5%' }}
        >
          下單
        </Button>
      </div>
    </div>
  );
};

export default BatchOrderPage;
