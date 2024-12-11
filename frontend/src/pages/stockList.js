import React, { useState, useEffect } from 'react';
import StockTable from '../components/stockTable';
import SearchContainer from '../components/searchContainer';
import { StockRequest } from '../api/request/stockRequest.js';
import { InvestmentRequest } from '../api/request/investmentRequest.js';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Modal, Input, Select, Radio, Card, Spin, Form } from 'antd';

const { Option } = Select;

const StockList = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [portfolioName, setPortfolioName] = useState('');
    const [isAddPortfolioModalVisible, setIsAddPortfolioModalVisible] = useState(false);
    const [portfolioNameInput, setPortfolioNameInput] = useState('');
    const [description, setDescription] = useState('');
    const [investmentData, setInvestmentData] = useState([]);  // 用來存儲投資組合
    const [form] = Form.useForm();
    const [stockPrices, setStockPrices] = useState({}); // 儲存每個股票的價格
    const [selectedOption, setSelectedOption] = useState('buyAndHold');

    // 處理選擇股票的變更
    const handleCheckboxChange = (e, stock) => {
        setSelectedStocks(prevSelectedStocks => {
            if (e.target.checked) {
                // 將選中的股票資料轉換為所需格式並加入選中的股票陣列
                const selectedStock = {
                    code: stock.code,  // 假設 code 對應到 id
                    name: stock.name,
                    price: stock.close,
                    amount: 0,
                    totalPrice: 0,
                };
                return [...prevSelectedStocks, selectedStock];
            } else {
                // 移除未選中的股票資料
                return prevSelectedStocks.filter(item => item.id !== stock.code);
            }
        });
    };


    // 獲取股票資料
    const fetchStockData = async () => {
        setIsLoading(true); // 開始載入
        try {
            const response = await StockRequest.getTwFif();
            setStockList(response.data);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false); // 結束載入
        }
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    const showModal = () => {
        fetchDropdownData();
        setIsModalVisible(true);
        console.log(selectedStocks)
    };

    const fetchDropdownData = () => {
        InvestmentRequest.getPortfolios()
            .then(response => {
                const portfolios = response.data.map(item => ({ ...item, key: item.id }));
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
    }

    // 查詢股票即時價格或收盤價
    const fetchStockPrice = (symbol) => {
        if (!stockPrices[symbol]) {
            InvestmentRequest.getStockPrice(symbol)
                .then(response => {
                    if (response.data) {
                        setStockPrices(prevPrices => ({
                            ...prevPrices,
                            [symbol]: {
                                price: response.data.price || 0,  // 預設為 0
                                name: response.data.name || '未知股票'  // 預設名稱
                            }
                        }));
                    } else {
                        console.error(`無法獲取股票 ${symbol} 的資料`);
                    }
                })
                .catch(error => {
                    console.error(`無法獲取股票 ${symbol} 的價格:`, error);
                });
        }
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // 處理數量變更並重新計算 totalPrice
    const handleAmountChange = (id, value) => {
        const updatedStocks = selectedStocks.map(stock => {
            // 計算 totalPrice = price * amount
            if (stock.id === id) {
                const updatedStock = {
                    ...stock,
                    amount: value,
                    totalPrice: stock.price * value // 根據價格和數量計算 totalPrice
                };
                return updatedStock;
            }
            return stock;
        });
        setSelectedStocks(updatedStocks);
    };

    const handleAddPortfolioClick = () => {
        setIsAddPortfolioModalVisible(true);
    };

    const handleAddPortfolioCancel = () => {
        setIsAddPortfolioModalVisible(false);
    };

    const handleAddPortfolioOk = () => {
        form.validateFields()
            .then(values => {
                const newPortfolio = {
                    name: values.portfolioName,
                    description: values.description,
                };
                InvestmentRequest.createPortfolio(newPortfolio)
                    .then(response => {
                        if (response.data && response.data.id) {
                            setIsAddPortfolioModalVisible(false);
                            form.resetFields();
                            alert('投資組合新增成功');
                            fetchDropdownData();
                        } else {
                            console.error('無法取得新建投資組合的 ID');
                        }
                    })
                    .catch(error => {
                        alert('新增投資組合失敗，請重試。');
                    });
            })
            .catch(info => {
                console.log('驗證失敗:', info);
            });
    };

    const handleOptionChange = e => {
        setSelectedOption(e.target.value);
    };

    return (
        <>
            <div className="d-flex flex-column justify-content-between align-items-center vh-100">
                <div className="sticky-container d-flex justify-content-between align-items-center" style={{ marginTop: '6rem' }}>
                    <Card style={{ flexGrow: 1 }}>
                        <SearchContainer />
                    </Card>
                    <Button type="primary" className="ms-3 button2" onClick={showModal}>
                        新增至投資組合
                    </Button>
                </div>

                <div className="mt-2" style={{ flexGrow: 1, width: '100%' }}>
                    <Spin spinning={isLoading} indicator={<LoadingOutlined spin />} size="large">
                        <StockTable data={stockList} onCheckboxChange={handleCheckboxChange} selectedCodes={selectedStocks.map(item => item.code)} />
                    </Spin>
                </div>
                <Modal
                    title="股票投資"
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText="送出"
                    okButtonProps={{
                        className: "ms-auto button2"
                    }}
                >
                    <div>
                        <Radio.Group onChange={handleOptionChange} value={selectedOption}>
                            <Radio value="buyAndHold">Buy and Hold</Radio>
                            <Radio value="naive" style={{ marginLeft: '10px' }}>Naive</Radio>
                            <Radio value="custom" style={{ marginLeft: '10px' }}>自訂</Radio>
                        </Radio.Group>
                        {selectedStocks.map(stock => (
                            <div key={stock.code} style={{ marginBottom: '15px' }}>
                                <h4>{stock.name} (代碼: {stock.code})</h4>
                                <div style={{ marginTop: '10px' }}>
                                    <Input
                                        type="number"
                                        value={stock.amount}
                                        onChange={(e) => handleAmountChange(stock.id, e.target.value)}
                                        placeholder="輸入股數"
                                        style={{ width: '150px', marginRight: '10px' }}
                                    />
                                    <span>現時股價：{stock.price.toFixed(2)} 總花費: {stock.totalPrice.toFixed(2)} 元</span>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px' }}>
                            <Select
                                style={{ width: '200px', marginRight: '10px' }}
                                placeholder="選擇投資組合"
                                onChange={value => console.log(`選擇的投資組合 ID: ${value}`)}
                            >
                                {investmentData.map(portfolio => (
                                    <Option key={portfolio.id} value={portfolio.id}>
                                        {portfolio.name}
                                    </Option>
                                ))}
                            </Select>
                            <Button type="primary" className="ms-auto button2" onClick={handleAddPortfolioClick}>新增投資組合</Button>
                            <Modal
                                title="新增投資組合"
                                open={isAddPortfolioModalVisible}
                                onOk={handleAddPortfolioOk}
                                onCancel={handleAddPortfolioCancel}
                            >
                                <Form form={form} layout="vertical">
                                    <Form.Item name="portfolioName" label="投資組合名稱" rules={[{ required: true, message: '請輸入投資組合名稱' }]}>
                                        <Input placeholder="請輸入投資組合名稱" />
                                    </Form.Item>

                                    <Form.Item name="description" label="投資組合描述" rules={[{ required: true, message: '請輸入投資組合描述' }]}>
                                        <Input placeholder="請輸入投資組合描述" />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default StockList;
