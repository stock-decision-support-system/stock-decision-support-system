import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Select, Input, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';  // 用於顯示圖示
import axios from 'axios';  // 用於 API 調用
import '../assets/css/investmentList.css';
import { config } from "../config";  

const BASE_URL = config.API_URL;

const { Option } = Select;

const InvestmentList = () => {
  const navigate = useNavigate();
  const [investmentData, setInvestmentData] = useState([]);  // 用來存儲投資組合
  const [isModalVisible, setIsModalVisible] = useState(false);  // 控制模態框顯示
  const [form] = Form.useForm();
  const [selectedStocks, setSelectedStocks] = useState([]);  // 用於儲存選擇的股票
  const [stockOptions, setStockOptions] = useState([]);  // 用於儲存股票選項
  const [stockPrices, setStockPrices] = useState({}); // 儲存每個股票的價格
  
  // 獲取股票選項
  useEffect(() => {
    axios.get(`${BASE_URL}/api/stocks/`)
      .then(response => {
        if (response.data.status === 'success') {
          console.log('獲取到的股票數據:', response.data.stocks);  // 調試用日誌
          setStockOptions(response.data.stocks);  // 成功後設置股票選項
        } else {
          console.error('獲取股票列表失敗:', response.data.message);
        }
      })
      .catch(error => {
        console.error('無法獲取股票列表:', error);
      });
  }, []);
  

  // 獲取用戶的投資組合資料
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${BASE_URL}/api/portfolios/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then(response => {
        console.log('後端返回的投資組合資料:', response.data);
        const portfolios = response.data.map(item => ({ ...item, key: item.id }));
  
        // 查詢所有投資組合中的股票價格和名稱
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
    } else {
      console.error('Token not found.');
    }
  }, []);  // 這裡的依賴數組設置為空，確保只在頁面加載時運行
  

  // 查詢股票即時價格或收盤價
const fetchStockPrice = (symbol) => {
  if (!stockPrices[symbol]) {  // 如果價格還未查詢過，才發送請求
    axios.get(`${BASE_URL}/api/stock_price/${symbol}/`)
      .then(response => {
        setStockPrices(prevPrices => ({
          ...prevPrices,
          [symbol]: {
            price: response.data.price,  // 儲存股票價格
            name: response.data.name     // 儲存股票名稱
          },
        }));
      })
      .catch(error => {
        console.error(`無法獲取股票 ${symbol} 的價格:`, error);
      });
  }
};
  
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const newPortfolio = {
          name: values.portfolioName,
          description: values.description,
          investments: selectedStocks.map(stockSymbol => ({
            symbol: stockSymbol,
            shares: values[`quantity_${stockSymbol}`],
            buy_price: values[`price_${stockSymbol}`],
          }))
        };

        const token = localStorage.getItem('token');
        if (token) {
          axios.post(`${BASE_URL}/api/portfolios/create/`, newPortfolio, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          })
          .then(response => {
            setInvestmentData([...investmentData, { ...response.data, key: response.data.id }]);
            setIsModalVisible(false);
            form.resetFields();
            
            // 新增成功後刷新頁面
            window.location.reload();
          })
          .catch(error => {
            console.error('新增投資組合失敗:', error.response?.data || error.message);
          });
        } else {
          console.error('Token not found');
        }
      })
      .catch(info => {
        console.log('驗證失敗:', info);
      });
  };

  // 刪除投資組合
  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.delete(`${BASE_URL}/api/portfolios/${id}/delete/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      .then(() => {
        setInvestmentData(investmentData.filter(item => item.id !== id));
      })
      .catch(error => {
        console.error('刪除投資組合失敗:', error);
      });
    } else {
      console.error('Token not found');
    }
  };

  // 編輯投資組合
  const handleEdit = (record) => {
    form.setFieldsValue({
      portfolioName: record.name,
      description: record.description,
    });
    setIsModalVisible(true);
  };

  // 控制模態框顯示
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleStocksChange = (value) => {
    setSelectedStocks(value);
  };

  const columns = [
    {
      title: '投資組合名稱',
      dataIndex: 'name',
      key: 'name',
      render: text => <strong>{text}</strong>,
    },
    {
      title: '總成本 (NT$)',
      dataIndex: 'marketValue',
      key: 'totalCost',
      render: (text, record) => {
        const portfolioStocks = Array.isArray(record.investments) ? record.investments : [];
  
        // 計算總成本
        const totalCost = portfolioStocks.reduce((acc, stock) => {
          const stockCost = stock.shares * stock.buy_price;
          return acc + stockCost;
        }, 0);
  
        return `NT$ ${totalCost.toLocaleString()}`;
      },
    },
    {
      title: '總市值 (NT$)',
      dataIndex: 'marketValue',
      key: 'marketValue',
      render: (text, record) => {
        const portfolioStocks = Array.isArray(record.investments) ? record.investments : [];
    
        // 計算總市值
        const totalMarketValue = portfolioStocks.reduce((acc, stock) => {
          const stockInfo = stockPrices[stock.symbol] || {};
          const stockPrice = stockInfo.price || 0;
          const stockMarketValue = stock.shares * stockPrice;
          return acc + stockMarketValue;
        }, 0);
    
        const stockDetails = portfolioStocks.map(stock => {
          const stockInfo = stockPrices[stock.symbol] || {};
          const stockPrice = stockInfo.price || 0;
          const stockName = stockInfo.name || "未知股票名稱";
          const marketValue = stock.shares * stockPrice;
    
          return (
            <div key={stock.symbol} style={{ marginBottom: '10px' }}>
              <div><strong>股票名稱:</strong> {stock.symbol} {stockName}</div>
              <div><strong>股數:</strong> {stock.shares} 股</div>
              <div><strong>個股價值:</strong> NT$ {stockPrice.toLocaleString()} / 股</div>
              <div><strong>市值:</strong> NT$ {marketValue.toLocaleString()}</div>
            </div>
          );
        });
    
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>NT$ {totalMarketValue.toLocaleString()}</div>
            <Popover 
              content={(
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {stockDetails}
                </div>
              )} 
              title={`${record.name} 的股票清單`} 
              trigger="click"
            >
              <InfoCircleOutlined style={{ marginLeft: 8, cursor: 'pointer', color: '#1890ff' }} />
            </Popover>
          </div>
        );
      },
    },
    {
      title: '總回報率 (%)',
      dataIndex: 'performance',
      key: 'performance',
      render: (text, record) => {
        const portfolioStocks = Array.isArray(record.investments) ? record.investments : [];
  
        // 計算總市值
        const totalMarketValue = portfolioStocks.reduce((acc, stock) => {
          const stockInfo = stockPrices[stock.symbol] || {};
          const stockPrice = stockInfo.price || 0;
          const stockMarketValue = stock.shares * stockPrice;
          return acc + stockMarketValue;
        }, 0);
  
        // 計算總成本
        const totalCost = portfolioStocks.reduce((acc, stock) => {
          const stockCost = stock.shares * stock.buy_price;
          return acc + stockCost;
        }, 0);
  
        // 計算總回報率
        const totalReturnRate = totalCost > 0 ? ((totalMarketValue - totalCost) / totalCost) * 100 : 0;
  
        return (
          <span style={{ color: totalReturnRate >= 0 ? 'red' : 'green' }}>
            {totalReturnRate.toFixed(2)}%
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>編輯</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>刪除</Button>
        </span>
      ),
    }
  ];
   
  

  return (
    <div className='container'>
      <h1 className="title">投資組合總覽</h1>
      <Button type="primary" onClick={showModal} style={{ marginBottom: 16 }}>
        新增投資組合
      </Button>
      <Table 
        columns={columns} 
        dataSource={investmentData}
        onRow={(record) => ({
          onClick: () => {
            navigate(`/portfolio/${record.id}`);
          },
        })}
        pagination={false} 
        bordered
        scroll={{ y: 400 }}
        rowClassName={(record) => record.performance >= 0 ? 'positive-row' : 'negative-row'}
      />
      
      <Modal 
        title="新增投資組合" 
        open={isModalVisible}  // 控制模態框顯示
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
            name="description"
            label="投資組合描述"
            rules={[{ required: true, message: '請輸入投資組合描述' }]}
          >
            <Input placeholder="請輸入投資組合描述" />
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
          {selectedStocks.map(stockSymbol => (
            <div key={stockSymbol}>
              <Form.Item
                name={`quantity_${stockSymbol}`}
                label={`股數 (${stockSymbol})`}
                rules={[{ required: true, message: `請輸入 ${stockSymbol} 的股數` }]}
              >
                <Input placeholder={`請輸入 ${stockSymbol} 的股數`} type="number" />
              </Form.Item>
              <Form.Item
                name={`price_${stockSymbol}`}
                label={`每股價格 (${stockSymbol})`}
                rules={[{ required: true, message: `請輸入 ${stockSymbol} 的每股價格` }]}
              >
                <Input placeholder={`請輸入 ${stockSymbol} 的每股價格`} type="number" />
              </Form.Item>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default InvestmentList;
