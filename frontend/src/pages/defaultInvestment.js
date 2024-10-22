import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

const { Option } = Select;
const { confirm } = Modal;  // 引入 confirm
const BASE_URL = config.API_URL;

const DefaultInvestment = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [investmentData, setInvestmentData] = useState([]); 
  const [stockOptions, setStockOptions] = useState([]);  
  const [selectedStocks, setSelectedStocks] = useState([]);  
  const [stockQuantities, setStockQuantities] = useState({}); 
  const [stockPrices, setStockPrices] = useState({}); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditing, setIsEditing] = useState(false);  
  const [editingPortfolioId, setEditingPortfolioId] = useState(null); 
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
      })
      .catch(error => {
        console.error('無法獲取投資組合資料:', error);
      });
  }, []);

  // 取得股票選項資料
useEffect(() => {
  axios.get(`${BASE_URL}/investment/stocks/`)
  .then(response => {
    const stocks = response.data.data; // 這裡取得的是數組
    setStockOptions(stocks.map(stock => ({
      value: stock.symbol,
      label: `${stock.name} (${stock.symbol})`
    })));
  })
  .catch(error => {
    console.error('無法獲取股票列表:', error);
  });
}, []);



  // 新增或編輯投資組合
  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const portfolioData = {
          name: values.portfolioName,
          stocks: selectedStocks.map(stockSymbol => ({
            stock_symbol: stockSymbol,
            stock_name: stockOptions.find(stock => stock.symbol === stockSymbol)?.name || '',
            quantity: stockQuantities[stockSymbol] || 1,  
          })),
          investment_threshold: calculateInvestmentThreshold(),
        };

        if (isEditing) {
          // 編輯模式下的更新操作
          axios.put(`${BASE_URL}/investment/default-investment-portfolios/${editingPortfolioId}/`, portfolioData)
            .then(response => {
              setInvestmentData(prevData =>
                prevData.map(portfolio =>
                  portfolio.id === editingPortfolioId ? response.data : portfolio
                )
              );
              message.success('投資組合已更新');
              resetForm();
            })
            .catch(error => {
              console.error('更新投資組合失敗:', error.response?.data || error.message);
            });
        } else {
          // 新增操作
          axios.post(`${BASE_URL}/investment/default-investment-portfolios/`, portfolioData)
            .then(response => {
              setInvestmentData([...investmentData, response.data]);
              message.success('新增投資組合成功');
              resetForm();
            })
            .catch(error => {
              console.error('新增投資組合失敗:', error.response?.data || error.message);
            });
        }
      })
      .catch(error => {
        console.error('表單驗證失敗:', error);
      });
  };

  // 打開新增或編輯的模態框
  const handleAddPortfolio = () => {
    resetForm();
    setIsModalOpen(true);
  };

// 打開編輯模態框並載入資料
const handleEdit = (record) => {
  console.log('Editing record:', record);
  setIsEditing(true);
  setEditingPortfolioId(record.id);
  form.setFieldsValue({
    portfolioName: record.name,
    investment_threshold: record.investment_threshold,
  });
  
  const newSelectedStocks = record.stocks.map(stock => stock.stock_symbol);
  console.log('Selected stocks:', newSelectedStocks);
  setSelectedStocks(newSelectedStocks);  // 確保這行代碼在打開模態框前執行
  setIsModalOpen(true);  // 設置選中股票後再打開模態框


  const newStockQuantities = {};
  record.stocks.forEach(stock => {
    newStockQuantities[stock.stock_symbol] = stock.quantity;
  });
  setStockQuantities(newStockQuantities);

  setIsModalOpen(true);
};




  // 刪除投資組合並彈出二次確認窗口
  const showDeleteConfirm = (id, name) => {
    confirm({
      title: `你確定要刪除投資組合 "${name}" 嗎?`,
      content: '刪除後將無法恢復此投資組合',
      okText: '是',
      okType: 'danger',
      cancelText: '否',
      onOk() {
        handleDelete(id);
      },
      onCancel() {
        console.log('刪除操作已取消');
      },
    });
  };

  // 刪除投資組合
  const handleDelete = (id) => {
    axios.delete(`${BASE_URL}/investment/default-investment-portfolios-delete/${id}/`)
    .then(() => {
      setInvestmentData(prevData => prevData.filter(portfolio => portfolio.id !== id));
      message.success('投資組合已刪除');
    })
    .catch(error => {
      console.error('刪除投資組合失敗:', error.response?.data || error.message);
    });  
  };

  // 計算投資門檻
  const calculateInvestmentThreshold = () => {
    return selectedStocks.reduce((total, stockSymbol) => {
      const price = stockPrices[stockSymbol] || 0;
      const quantity = stockQuantities[stockSymbol] || 1;
      return total + (price * quantity);
    }, 0);
  };

  // 重置表單和狀態
  const resetForm = () => {
    form.resetFields();
    setIsEditing(false);
    setEditingPortfolioId(null);
    setSelectedStocks([]);
    setStockQuantities({});
    setStockPrices({});
    setIsModalOpen(false);
  };

  // 處理股票選擇變化
  const handleStocksChange = (value) => {
    setSelectedStocks(value);

    value.forEach(stockSymbol => {
      if (!stockPrices[stockSymbol]) {
        axios.get(`${BASE_URL}/investment/stocks/${stockSymbol}/price/`)  // 假設這是股票價格的 API
          .then(response => {
            const price = response.data.price || 0;
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
  
  useEffect(() => {
    console.log("Selected Stocks Updated:", selectedStocks);
  }, [selectedStocks]);

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
      title: '詳細畫面',
      key: 'details',
      render: (text, record) => (
        <Button onClick={() => navigate(`/investment/${record.id}`)}>
          查看詳細
        </Button>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        isAdmin && (
          <>
            <Button onClick={() => handleEdit(record)} style={{ marginLeft: 10 }}>編輯</Button>
            <Button danger onClick={() => showDeleteConfirm(record.id, record.name)} style={{ marginLeft: 10 }}>刪除</Button>
          </>
        )
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
        <Table columns={columns} dataSource={investmentData} rowKey="id" pagination={{ pageSize: 5 }} />
      </div>

      <Modal
        title={isEditing ? "編輯投資組合" : "新增投資組合"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={resetForm}
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

          <Form.Item name="stocks" label="選擇股票" rules={[{ required: true, message: '請選擇至少一支股票' }]}>
            <Select
              mode="multiple"
              placeholder="選擇股票"
              value={selectedStocks}
              onChange={handleStocksChange}
              style={{ width: '100%' }}
            >
              {stockOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
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
