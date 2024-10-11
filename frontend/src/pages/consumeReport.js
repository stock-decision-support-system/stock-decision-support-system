import React, { useState, useEffect } from 'react';
import { message, Card, Select, Typography, Spin } from 'antd';
import { AccountingRequest } from '../api/request/accountingRequest.js';
import { CategoryRequest } from '../api/request/categoryRequest.js';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件
import { Bar } from '@ant-design/plots';

const { Option } = Select;

const ConsumeReport = () => {
    const [consumeTypes, setConsumeTypes] = useState([]); // 存儲選中的消費類型
    const [totalAmount, setTotalAmount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetchTotalAmount(); // 獲取總金額
        fetchFormData(); // 獲取表單數據
        setLoading(false);
    }, []);

    const fetchTotalAmount = async () => {
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
            })
            .catch((error) => {
                message.error(error.message); // 顯示錯誤信息
            });
    };

    const fetchFormData = async () => {
        CategoryRequest.getConsumeTypeChart()
            .then(response => {
                setData(response.data.expense); // 設置消費數據
            })
            .catch((error) => {
                message.error(error.message); // 顯示錯誤信息
            });
    };

    const handleSelectChange = (value) => {
        if (value.includes(0)) { // 如果選擇了"全部" (值為0)
            // 獲取所有消費類型的 ID
            const allIds = data.map(item => item.id);
            setConsumeTypes(allIds); // 設置為所有 ID
        } else {
            setConsumeTypes(value); // 更新選中的消費類型
        }
    };

    // 過濾顯示的數據
    const filteredData = consumeTypes.length > 0 
        ? data.filter(item => consumeTypes.includes(item.id)) 
        : data;

    const config = {
        data: filteredData,
        xField: 'value',
        yField: 'name',
        seriesField: 'name',
        legend: {
            position: 'top-left',
        },
    };

    return (
        <div className="generalreport-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'5'} />
            <div className="generalreport-container-all" style={{ flex: 1, marginLeft: '1rem' }}>
                <Card title="消費習慣分析" style={{ marginBottom: '1rem', height: '100%', width: '95%' }}>
                    <div className="generalreport-account-form">
                        <Spin spinning={loading}>
                            <div className="generalreport-dropdown-container" style={{ marginBottom: '1rem' }}>
                                <Select
                                    mode="multiple" // 允許多選
                                    onChange={handleSelectChange}
                                    style={{ width: '100%' }} // 確保 Select 占滿 Col 寬度
                                    value={consumeTypes}
                                >
                                    <Option value={0}>全部</Option>
                                    {data.map((item) => (
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div className="generalreport-report-container">
                                <div className="chart-container">
                                    {filteredData.length > 0 ? (
                                        <Bar {...config} />
                                    ) : (
                                        <Typography.Text>暫無圖表數據</Typography.Text>
                                    )}
                                </div>
                            </div>
                        </Spin>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ConsumeReport;
