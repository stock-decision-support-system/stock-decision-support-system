import React, { useState, useEffect } from 'react';
import StockTable from '../components/stockTable';
import SearchContainer from '../components/searchContainer';
import { StockRequest } from '../api/request/stockRequest.js';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Modal, Input, Select, Radio, Card, Spin } from 'antd';

const { Option } = Select;

const StockList = () => {
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [portfolioName, setPortfolioName] = useState('');

    // 處理選擇股票的變更
    const handleCheckboxChange = (e, code) => {
        if (e.target.checked) {
            setSelectedStocks([...selectedStocks, code]);
        } else {
            setSelectedStocks(selectedStocks.filter(stockCode => stockCode !== code));
        }
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
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    // 使用假資料來模擬股票
    const [stocks, setStocks] = useState([
        { id: 1101, name: '中油', selectedOption: 'buyAndHold', customAmount: '', amount: 0 },
        { id: 1216, name: '統一', selectedOption: 'buyAndHold', customAmount: '', amount: 0 },
        { id: 1301, name: '台塑', selectedOption: 'buyAndHold', customAmount: '', amount: 0 }
    ]);

    // 處理選擇的投資方式變更
    const handleOptionChange = (id, value) => {
        const updatedStocks = stocks.map(stock =>
            stock.id === id ? { ...stock, selectedOption: value, customAmount: '' } : stock
        );
        setStocks(updatedStocks);
    };

    // 處理自訂數量的變更
    const handleCustomAmountChange = (id, value) => {
        const updatedStocks = stocks.map(stock =>
            stock.id === id ? { ...stock, customAmount: value } : stock
        );
        setStocks(updatedStocks);
    };

    const handleAddPortfolioClick = () => {
        console.log("新增投資組合");
        // 在此實作新增投資組合的邏輯
    };

    // 計算總花費
    const totalPrice = (stock) => {
        const priceMap = {
            1101: 32.2, // 中油
            1216: 550.0, // 台積電
            1301: 780.0 // 聯發科
        };
        const price = priceMap[stock.id] || 0; // 根據 ID 取得對應的股價
        const amount = stock.selectedOption === 'custom' ? stock.customAmount : stock.amount;
        return price * (amount || 0);
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
                        <StockTable data={stockList} onCheckboxChange={handleCheckboxChange} selectedCodes={selectedStocks} />
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
                        {stocks.map(stock => (
                            <div key={stock.id} style={{ marginBottom: '15px' }}>
                                <h4>{stock.name} (ID: {stock.id})</h4>
                                <Radio.Group
                                    onChange={(e) => handleOptionChange(stock.id, e.target.value)}
                                    value={stock.selectedOption}
                                >
                                    <Radio value="buyAndHold">Buy and Hold</Radio>
                                    <Radio value="naive" style={{ marginLeft: '10px' }}>Naive</Radio>
                                    <Radio value="custom" style={{ marginLeft: '10px' }}>自訂</Radio>
                                </Radio.Group>
                                <div style={{ marginTop: '10px' }}>
                                    <Input
                                        type="number"
                                        value={stock.selectedOption === 'custom' ? stock.customAmount : stock.amount}
                                        onChange={(e) => handleCustomAmountChange(stock.id, e.target.value)}
                                        placeholder="輸入股數"
                                        style={{ width: '150px', marginRight: '10px' }}
                                    />
                                    <span>現時股價：{totalPrice(stock).toFixed(2)} 總花費: {totalPrice(stock).toFixed(2)} 元</span>
                                </div>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px' }}>
                            <Select placeholder="選擇投資組合" style={{ width: '200px', marginRight: '10px' }}>
                                <Option value="portfolio1">投資組合 1</Option>
                                <Option value="portfolio2">投資組合 2</Option>
                                <Option value="portfolio3">投資組合 3</Option>
                            </Select>
                            <Button type="primary" className="ms-auto button2" onClick={handleAddPortfolioClick}>新增投資組合</Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default StockList;
