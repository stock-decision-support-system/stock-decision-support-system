import React, { useState, useEffect } from "react";
import { Modal, Button, List, Card, Space, Typography, message, Spin, Select, Form, Radio, Input, notification } from "antd";
import { InvestmentRequest } from '../api/request/investmentRequest.js';
import { StockRequest } from '../api/request/stockRequest.js';
import adviceImage from '../assets/images/advice.png';

const { Text } = Typography;
const { Option } = Select;

const AdviceModal = ({
    isModalVisible,
    loading,
    advice,
    formatAdvice,
    handleCancel,
    stocks,
}) => {
    const [step, setStep] = useState(1); // 用來控制當前頁面
    const [leftItems, setLeftItems] = useState(stocks || []);
    const [rightItems, setRightItems] = useState([]);
    const [form] = Form.useForm();
    const [investmentData, setInvestmentData] = useState([]);  // 用來存儲投資組合
    const [stockPrices, setStockPrices] = useState([]); // 儲存每個股票的價格
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedOption, setSelectedOption] = useState('0');
    const [investmentAmount, setInvestmentAmount] = useState(0); // 用來存儲投資金額

    const fetchStockPrices = async (stocks) => {
        const codeList = stocks.map(item => item.symbol); // 取得所有股票的 symbol
        const payload = { codeList: codeList }; // 準備發送的資料
        try {
            const data = await StockRequest.getSelectStock(payload);
            const fetchedStockPrices = data.data;  // 假設 data 是返回的股價資料
            setStockPrices(fetchedStockPrices); // 更新股價資料

            // 將股價加入到 leftList 中
            const updatedLeftList = stocks.map(item => {
                const stockPrice = fetchedStockPrices.find(stock => stock.code === item.symbol);
                if (stockPrice) {
                    return { ...item, buy_price: stockPrice.buy_price }; // 將股價添加到對應的股票項目中
                }
                return item;
            });

            setLeftItems(updatedLeftList); // 更新 leftList

        } catch (error) {
            message.error("Failed to fetch stock prices.");
        }
    };

    // 使用 useEffect 監聽 stocks 變動，並更新 leftItems
    useEffect(() => {
        setLeftItems(stocks || []);
        fetchStockPrices(stocks || []);  // 初始化加載股價
    }, [stocks]);

    // 處理「下一步」按鈕點擊事件
    const handleNext = () => {
        if (!loading) {
            if (step < 3) {
                if (step == 1 && stockPrices == []) {
                    fetchStockPrices();
                }
                setStep(step + 1); // 點擊「下一步」後切換到下一個頁面
            } else {
                handleSubmit(); // 如果已經是第三步，則執行提交
            }
        }
    };

    // 處理「回到上一步」按鈕點擊事件
    const handlePrevious = () => {
        if (step > 1) {
            setStep(step - 1); // 點擊「回到上一步」後切換到上一個頁面
        }
    };

    const moveToRight = (symbol) => {
        const item = leftItems.find((i) => i.symbol === symbol);
        if (item) {
            setLeftItems((prev) => prev.filter((i) => i.symbol !== symbol));
            setRightItems((prev) => [...prev, item]);
        }
    };

    const moveToLeft = (symbol) => {
        const item = rightItems.find((i) => i.symbol === symbol);
        if (item) {
            setRightItems((prev) => prev.filter((i) => i.symbol !== symbol));
            setLeftItems((prev) => [...prev, item]);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption != '0') {
            setInvestmentAmount(null);
        }
        form.validateFields()
            .then(values => {
                const portfolioData = {
                    name: values.portfolioName,
                    description: values.description,
                    buyType: selectedOption,
                    quota: investmentAmount,
                    investments: rightItems.map(item => ({
                        symbol: item.symbol,
                        buy_price: values[`stockPrice_${item.symbol}`],  // 從表單中提取股價
                        shares: values[`quantity_${item.symbol}`],  // 從表單中提取股數
                    })),
                };
                InvestmentRequest.createPortfolio(portfolioData)
                    .then(response => {
                        if (response.data && response.data.id) {
                            handleCancel();
                            form.resetFields();

                            notification.success({
                                message: '新增成功',
                                description: '投資組合新增成功',
                            });
                        } else {
                            console.error('無法取得新建投資組合的 ID');
                        }
                    })
                    .catch(error => {
                        console.error('新增投資組合失敗:', error.response?.data || error.message);
                        notification.error({
                            message: '新增失敗',
                            description: '新增投資組合失敗，請重試。',
                        });
                    });
            })
            .catch(error => {
                console.error('表單驗證失敗:', error);
            });
    };

    const handleOptionChange = e => {
        setSelectedOption(e.target.value);
    };

    const handleQuantityChange = (e, symbol) => {
        const quantity = e.target.value;
        setRightItems(prevItems =>
            prevItems.map(item =>
                item.symbol === symbol ? { ...item, quantity: quantity } : item
            )
        );
    };

    const handleInvestmentAmountChange = (e) => {
        setInvestmentAmount(e.target.value);
    };

    return (
        <Modal
            title="AI儲蓄建議"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
                <Button key="close" onClick={handleCancel} disabled={loading}>
                    關閉
                </Button>,
                step > 1 && (
                    <Button key="previous" onClick={handlePrevious}>
                        回到上一步
                    </Button>
                ),
                <Button key="next" type="primary" onClick={handleNext}>
                    {step === 3 ? "完成" : "下一步"}
                </Button>,
            ]}
            width={800}
            bodyStyle={{ height: 600, overflowY: "auto" }}
        >
            {loading ? (
                <Spin size="large" />
            ) : step === 1 ? (
                <div style={{ textAlign: "left" }}>
                    <img
                        src={adviceImage}
                        alt="ai建議"
                        style={{ height: '150px' }}
                    />
                    {formatAdvice(advice)} {/* 顯示建議內容 */}
                </div>
            ) : step === 2 ? (
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                        {/* 左側清單 */}
                        <div>
                            <h3>建議股票</h3>
                            <Card
                                style={{
                                    width: 300,
                                    height: "500px",
                                    overflowY: "auto",
                                }}
                            >
                                <List
                                    dataSource={leftItems}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    onClick={() => moveToRight(item.symbol)}
                                                >
                                                    &gt;
                                                </Button>,
                                            ]}
                                        >
                                            <Space direction="vertical">
                                                <Text>{item.name}</Text>
                                                <Text type="secondary">
                                                    {item.type} - {item.risk}
                                                </Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>

                        {/* 右側清單 */}
                        <div>
                            <h3>已選股票</h3>
                            <Card
                                style={{
                                    width: 300,
                                    height: "500px",
                                    overflowY: "auto",
                                }}
                            >
                                <List
                                    dataSource={rightItems}
                                    renderItem={(item) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="default"
                                                    shape="circle"
                                                    onClick={() => moveToLeft(item.symbol)}
                                                >
                                                    &lt;
                                                </Button>,
                                            ]}
                                        >
                                            <Space direction="vertical">
                                                <Text>{item.name}</Text>
                                                <Text type="secondary">
                                                    {item.type} - {item.risk}
                                                </Text>
                                            </Space>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <Form form={form} layout="vertical">
                        {/* 第三頁：確認並提交選擇的股票 */}
                        <h3>選擇投資策略</h3>
                        <div>
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
                            <Radio.Group onChange={handleOptionChange} value={selectedOption}>
                                <Radio value="0">Buy and Hold</Radio>
                                <Radio value="1" style={{ marginLeft: '10px' }}>Naive</Radio>
                                <Radio value="2" style={{ marginLeft: '10px' }}>自訂</Radio>
                            </Radio.Group>
                            {selectedOption === "0" ? (
                                <p>
                                    未來將會依照投資金額每月買入最大股數
                                </p>
                            ) : selectedOption === "1" ? (
                                <p>
                                    每日將會寄送股數變動建議給您
                                </p>
                            ) : (
                                <p>
                                    依您的個人喜好來決定購買的股數
                                </p>
                            )}
                            {/* 當選擇 buyAndHold 或 naive 顯示金額輸入框並計算股數 */}
                            {(selectedOption === "0") && (
                                <Form.Item label="投資金額" required>
                                    <Input
                                        type="number"
                                        value={investmentAmount}
                                        onChange={handleInvestmentAmountChange}
                                        placeholder="請輸入金額"
                                    />
                                </Form.Item>
                            )}
                        </div>
                        <List
                            dataSource={rightItems}
                            renderItem={(item) => (
                                <List.Item>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Text>{item.name} ({item.symbol})</Text>  {/* 顯示股票名稱和symbol */}
                                        <Text type="secondary">
                                            {item.type} - {item.risk}
                                        </Text>
                                        {/* 顯示現時股價 */}
                                        <Space style={{ width: '100%', display: 'ruby' }}>
                                            {/* 現時股價傳遞到 Form */}
                                            <Form.Item
                                                name={`stockPrice_${item.symbol}`}
                                                label="現時股價"
                                                style={{ width: '100%' }}
                                                initialValue={stockPrices.find(stock => stock.code === item.symbol)?.buy_price}
                                            >
                                                <Input
                                                    type="text"
                                                    disabled
                                                />
                                            </Form.Item>
                                            {/* 用戶輸入購買股數 */}
                                            <Form.Item
                                                name={`quantity_${item.symbol}`}
                                                label="輸入股數"
                                                style={{ width: '100%' }}
                                                rules={[{ required: true, message: '請輸入股數' }]}
                                            >
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="請輸入股數"
                                                    onChange={(e) => handleQuantityChange(e, item.symbol)}
                                                />
                                            </Form.Item>
                                        </Space>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Form>

                </div>
            )}
        </Modal>
    );
};

export default AdviceModal;
