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
        // 使用 console.log 顯示回傳的資料
        console.log('後端返回的資料:', response.data);
  
        const portfolio = response.data; // 拿到完整投資組合資料
        const stocks = portfolio.stocks || []; // 從投資組合資料中取出 stocks 陣列
  
        if (stocks.length === 0) {
          console.warn('投資組合中沒有股票');
        }
  
        // 顯示解析後的股票代號
        stocks.forEach(stock => {
          console.log(`股票代號: ${stock.stock_symbol}, 股票名稱: ${stock.stock_name}`);
        });
  
        setSelectedPortfolio(portfolio); // 設定已選擇的投資組合
        setStocks(stocks); // 設定從投資組合中獲取的股票列表
        setStockOrders(stocks.map(stock => ({
          symbol: stock.stock_symbol,   // 股票代號
          quantity: stock.quantity,     // 從後端獲取默認的下單數量
          price: 0                      // 默認價格，讓使用者手動輸入
        })));
      })
      .catch(error => {
        console.error('無法獲取投資組合股票資料:', error);
        message.error('無法獲取投資組合股票資料');
      });
  };
  
  

  // 批次下單
  const handlePlaceOrders = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    const stock_symbols = stockOrders.map(order => order.symbol);
    const order_quantities = stockOrders.map(order => order.quantity);
    const order_prices = stockOrders.map(order => order.price);
    
    axios.post('http://localhost:8000/api/place-odd-lot-orders/', {
      stock_symbols,
      order_quantities,
      order_prices,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }).then(response => {
      message.success('批次下單成功');
    }).catch(error => {
      console.error('批次下單失敗:', error);
      message.error('批次下單失敗，請檢查網路連線');
    }).finally(() => {
      setLoading(false);
    });
  };

  // 更新股票的下單數量和價格
  const handleOrderChange = (symbol, field, value) => {
    setStockOrders(stockOrders.map(order => {
      if (order.symbol === symbol) {
        return { ...order, [field]: value };
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
          defaultValue={0}
          onChange={(value) => handleOrderChange(record.symbol, 'price', value)}
        />
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
