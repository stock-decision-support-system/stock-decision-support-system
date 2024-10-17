import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

const { Option } = Select;
const BASE_URL = config.API_URL

const DefaultInvestment = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [investmentData, setInvestmentData] = useState([]); 
  const [stockOptions, setStockOptions] = useState([]);  
  const [selectedStocks, setSelectedStocks] = useState([]);  
  const [stockQuantities, setStockQuantities] = useState({}); 
  const [stockPrices, setStockPrices] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [form] = Form.useForm();
  const navigate = useNavigate(); 

  // 檢查使用者是否為管理員
  useEffect(() => {
    const isStaff = localStorage.getItem('is_staff') === 'true';
    const isSuperuser = localStorage.getItem('is_superuser') === 'true';
    if (isStaff && isSuperuser) {
      setIsAdmin(true);
    }
  }, []);

  // 取得所有投資組合資料
  useEffect(() => {
    axios.get(`${BASE_URL}/investment/default-investment-portfolios/`)
      .then(response => {
        const portfolios = response.data;
        setInvestmentData(portfolios);

        // 在抓取完投資組合後，逐一計算每個投資組合的投資門檻
        portfolios.forEach(portfolio => calculateThreshold(portfolio.id));
      })
      .catch(error => {
        console.error('無法獲取投資組合資料:', error);
      });
  }, []);

  // 取得股票選項資料
// 取得股票選項資料
useEffect(() => {
  axios.get(`${BASE_URL}/investment/stocks/`)
    .then(response => {
      // console.log('取得的股票選項:', response.data);  // 確認股票選項資料
      setStockOptions(response.data.data);  // 確保提取的是 data 裡的內容
    })
    .catch(error => {
      console.error('無法獲取股票列表:', error);
    });
}, []);

  // 計算投資組合的投資門檻
  const calculateThreshold = (portfolioId) => {
    console.log(`計算門檻: 投資組合 ID = ${portfolioId}`);
    
    axios.get(`${BASE_URL}/investment/calculate-threshold/${portfolioId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      const updatedThreshold = response.data.threshold;
      console.log(`更新的門檻: ${updatedThreshold}`);

      // 更新前端顯示的投資組合門檻資料
      setInvestmentData(prevData =>
        prevData.map(portfolio =>
          portfolio.id === portfolioId ? { ...portfolio, investment_threshold: updatedThreshold } : portfolio
        )
      );
    })
    .catch(error => {
      console.error('門檻計算失敗:', error.response?.data || error.message);
    });
  };

  // 新增投資組合
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const newPortfolio = {
          name: values.portfolioName, 
          stocks: selectedStocks.map(stockSymbol => ({
            stock_symbol: stockSymbol,
            stock_name: stockOptions.find(stock => stock.symbol === stockSymbol)?.name || '',
            quantity: stockQuantities[stockSymbol] || 1,  
          })),
          investment_threshold: calculateInvestmentThreshold(),
        };

        console.log('即將發送至後端的數據:', newPortfolio);

        axios.post(`${BASE_URL}/investment/default-investment-portfolios/`, newPortfolio)
          .then(response => {
            setInvestmentData([...investmentData, response.data]);
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

  const handleAddPortfolio = () => {
    setIsModalOpen(true);  // 將對話框設為打開狀態
  };
  

  // 處理股票選擇變化
  const handleStocksChange = (value) => {
    setSelectedStocks(value);

    value.forEach(stockSymbol => {
      if (!stockPrices[stockSymbol]) {
        axios.get(`${BASE_URL}/investment/stocks/${stockSymbol}/price/`)  // 假設這是股票價格的 API
          .then(response => {
            const price = response.data.price || 0;
            console.log(`Fetched price for ${stockSymbol}: ${price}`);
            setStockPrices(prevPrices => ({
              ...prevPrices,
              [stockSymbol]: price,
            }));
          })
          .catch(error => {
            console.error(`無法獲取股票 ${stockSymbol} 的價格:`, error);
          });
      }
    });
  };

  // 處理股票數量變化
  const handleQuantityChange = (stockSymbol, quantity) => {
    setStockQuantities(prevQuantities => ({
      ...prevQuantities,
      [stockSymbol]: quantity,
    }));
  };

  // 計算總投資門檻
  const calculateInvestmentThreshold = () => {
    return selectedStocks.reduce((total, stockSymbol) => {
      const price = stockPrices[stockSymbol] || 0;
      const quantity = stockQuantities[stockSymbol] || 1;
      return total + (price * quantity);
    }, 0);
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
      title: '動作',
      key: 'action',
      render: (text, record) => (
        <Button onClick={() => navigate(`/investment/${record.id}`)}>
          查看詳細
        </Button>
      ),
    },
  ];

  return (
    <div className='container' style={{marginTop:'8%'}}>
      <h1 className="title">投資組合總覽</h1>

      {isAdmin && (
        <Button type="primary" onClick={handleAddPortfolio} style={{ marginBottom: '20px' }} className='button2'>
          新增預設投資組合
        </Button>
      )}

      <div className="table-container">
        <Table columns={columns} dataSource={investmentData} rowKey="id"  pagination={{ pageSize: 5 }}  // 每頁顯示 5 筆資料
 />
      </div>
      <Modal
        title="新增投資組合"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
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
            {(Array.isArray(stockOptions) ? stockOptions : []).map(stock => (
              <Option key={stock.symbol} value={stock.symbol}>
                {stock.name} ({stock.symbol})
              </Option>
            ))}
          </Select>
          </Form.Item>

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
