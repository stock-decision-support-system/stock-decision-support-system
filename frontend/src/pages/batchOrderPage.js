import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Button, Table, InputNumber, message, Form } from 'antd';

const { Option } = Select;

const BatchOrderPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [stockOrders, setStockOrders] = useState([]);

  const [loading, setLoading] = useState(false);

  // 獲取預設投資組合
  useEffect(() => {
    axios.get('http://localhost:8000/investment/default-investment-portfolios/')
      .then(response => {
        setPortfolios(response.data);
      })
      .catch(error => {
        console.error('無法獲取投資組合資料:', error);
        message.error('無法獲取投資組合資料');
      });
  }, []);

  // 當選取的投資組合改變時，獲取投資組合的股票資料
  const handlePortfolioChange = (portfolioId) => {
    axios.get(`http://localhost:8000/investment/default-investment-portfolios/${portfolioId}/`)
      .then(response => {
        console.log('後端返回的資料:', response.data);
  
        const portfolio = response.data; 
        const stocks = portfolio.stocks || []; 

        if (stocks.length === 0) {
          console.warn('投資組合中沒有股票');
        }

        // 顯示解析後的股票代號
        stocks.forEach(stock => {
          console.log(`股票代號: ${stock.stock_symbol}, 股票名稱: ${stock.stock_name}`);
        });

        setSelectedPortfolio(portfolio);
        setStocks(stocks);
        setStockOrders(stocks.map(stock => ({
          symbol: stock.stock_symbol,
          quantity: stock.quantity || 1,  // 初始化 quantity
          price: stock.price || 0,        // 初始化 price
          action: 'Buy',
        })));        
      })
      .catch(error => {
        console.error('無法獲取投資組合股票資料:', error);
        message.error('無法獲取投資組合股票資料');
      });
  };

  const handlePlaceOrders = () => {
    console.log("即將發送的下單資料:", stockOrders);  
    const token = localStorage.getItem('token'); // 從 localStorage 中獲取 token
    if (!token) {
      message.error('尚未登入或缺少驗證 token');
      return;
    }
  
    axios.post('http://localhost:8000/api/place-odd-lot-orders/', {
      stock_symbols: stockOrders.map(order => order.symbol),
      order_quantities: stockOrders.map(order => order.quantity),
      order_prices: stockOrders.map(order => order.price),
      actions: stockOrders.map(order => order.action),  // 默認為 'Buy' 或 'Sell'
      price_types: stockOrders.map(() => 'LMT'), // 默認為限價單
      order_types: stockOrders.map(() => 'ROD'), // 默認為ROD
    },  {
      headers: {
        Authorization: `Bearer ${token}` // 將 token 加入到 Authorization headers 中
      }
    })
    .then(response => {
      console.log("批次下單成功:", response.data);
    })
    .catch(error => {
      console.error("批次下單失敗:", error.response?.data || error.message);
      message.error('批次下單失敗');
    });
  };
  

  // 更新股票的下單數量、價格和操作(買/賣)
  const handleOrderChange = (symbol, field, value) => {
    setStockOrders(stockOrders.map(order => {
      if (order.symbol === symbol) {
        return { ...order, [field]: value };  // 動態更新 `price` 或 `quantity`
      }
      return order;
    }));
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
          value={stockOrders.find(order => order.symbol === record.stock_symbol)?.price || 0}  // 從 `stockOrders` 中獲取當前 symbol 的 price 值
          onChange={(value) => handleOrderChange(record.stock_symbol, 'price', value)}  // 當用戶輸入新值時，觸發狀態更新
        />
      ),
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <Select
          defaultValue="Buy"  // 默認為買單
          onChange={(value) => handleOrderChange(record.symbol, 'action', value)}
        >
          <Option value="Buy">買</Option>
          <Option value="Sell">賣</Option>
        </Select>
      ),
    }
  ];

  return (
    <div>
      <h2>批次下單零股</h2>
      <Select
        placeholder="選擇投資組合"
        onChange={handlePortfolioChange}
        style={{ width: '300px', marginBottom: '20px' }}
      >
        {portfolios.map(portfolio => (
          <Option key={portfolio.id} value={portfolio.id}>
            {portfolio.name}
          </Option>
        ))}
      </Select>

      {stocks.length > 0 && (
        <Table
          columns={columns}
          dataSource={stocks}
          rowKey="symbol"
          pagination={false}
        />
      )}

      <Button
        type="primary"
        onClick={handlePlaceOrders}
        loading={loading}
        disabled={stocks.length === 0}
        style={{ marginTop: '20px' }}
      >
        下單
      </Button>
    </div>
  );
};

export default BatchOrderPage;
