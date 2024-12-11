import React, { useState, useEffect } from 'react';
import { message, Card, DatePicker, Button, Modal, Spin } from 'antd';
import { DualAxes } from '@ant-design/plots';
import { AccountingRequest } from '../api/request/accountingRequest';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件
import AdviceModal from '../components/adviceModal.js';
import '../assets/css/generalreport.css';
import { FinancialAnalysisRequest } from '../api/request/financialAnalysisRequest.js';
import axios from 'axios';
import { config } from "../config";
const BASE_URL = config.API_URL;

const { RangePicker } = DatePicker;

const GeneralReport = () => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [advice, setAdvice] = useState('')
    const [chartData, setChartData] = useState([]);
    const [selectedDates, setSelectedDates] = useState([null, null]); // 儲存選擇的日期範圍
    const [isVisible, setIsVisible] = useState(false);  // 初始狀態為不顯示
    const [isModalVisible, setIsModalVisible] = useState(false); // 控制 Modal 顯示狀態
    const [loading, setLoading] = useState(false); // 控制加載狀態
    const [stocks, setStocks] = useState([]);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);  // 切換顯示狀態
    };

    useEffect(() => {
        fetchTotalAmount();
        handleFetchData();
    }, []);

    const fetchAIAdvice = async () => {
        setLoading(true); // 開始加載
        FinancialAnalysisRequest.getAccountingAI()
            .then(response => {
                setAdvice(response.data[0].advice);
                setStocks(response.data[0].advice_json.stocks);
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                setAdvice('回應超時，請稍後在試');
                message.error(error.message);
            });
    }

    const fetchTotalAmount = async () => {
        AccountingRequest.getFinancialSummary()
            .then(response => {
                setTotalAmount(response.data.total_assets);
                setNetAmount(response.data.net_assets);
            })
            .catch((error) => {
                message.error(error.message);
            });
    };

    const handleFetchData = async () => {
        const token = localStorage.getItem('token');
        const [startDate, endDate] = selectedDates;

        // 設置 API 請求的日期範圍
        let requestUrl = `${BASE_URL}/asset-change/`;  // 使用 let 來聲明 requestUrl

        if (startDate || endDate) {
            requestUrl += '?';
        }

        // 如果 startDate 存在，則將其附加到請求中
        if (startDate) {
            requestUrl += `&start_date=${startDate.format('YYYY-MM-DD')}`;
        }

        // 如果 endDate 存在，則將其附加到請求中
        if (endDate) {
            requestUrl += `&end_date=${endDate.format('YYYY-MM-DD')}`;
        }

        try {
            const response = await axios.get(requestUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            setChartData(response.data.data);
        } catch (error) {
            message.error(error.message);
        }
    };

    const config = {
        data: [chartData, chartData],
        xField: 'date',
        yField: ['total_assets', 'net_assets'],
        geometryOptions: [
            {
                geometry: 'line',
                color: '#5B8FF9',
            },
            {
                geometry: 'line',
                color: '#5AD8A6',
            },
        ],
        meta: {
            total_assets: {
                alias: '總資產',
            },
            net_assets: {
                alias: '淨資產',
            },
        },
    };

    const showModal = () => {
        setIsModalVisible(true);
        fetchAIAdvice();
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const formatAdvice = (adviceText) => {
        const parts = adviceText.split("\n\n"); // 分割段落
        return parts.map((part, index) => {
            if (part.match(/^\d+\./)) {
                // 處理以數字開頭的項目列表
                const items = part.split("\n").map((item, idx) => (
                    <li key={`item-${index}-${idx}`}>{item.replace(/^\d+\.\s*/, '')}</li>
                ));
                return <ul key={`list-${index}`}>{items}</ul>;
            }
            return <p key={`para-${index}`}>{part}</p>;
        });
    };

    return (
        <div className="w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'3'} isVisible={isVisible} toggle={toggleVisibility} />
            <div className="generalreport-container-all" style={{ flex: 1, marginLeft: '1rem' }}>
                <Card title="報告圖表" style={{ marginBottom: '1rem', height: '100%', width: '95%' }}>
                    <div className="generalreport-account-form">
                        <div className="generalreport-dropdown-container" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                            <RangePicker
                                format="YYYY-MM-DD"
                                onChange={(dates) => setSelectedDates(dates)}
                                style={{ width: '95%' }} // 設定 RangePicker 的寬度
                            />
                            <Button className="button2" onClick={handleFetchData} style={{ marginLeft: '1rem' }}>
                                查詢
                            </Button>
                        </div>
                        <div className="generalreport-report-container">
                            <div className="chart-container">
                                <DualAxes {...config} />
                            </div>
                            <div style={{ display: 'flex', margin: '1rem' }}>
                                <div>
                                    <Button
                                        type="primary"
                                        style={{ display: 'block', margin: '0.5rem auto' }}
                                        onClick={showModal}
                                    >
                                        查看AI儲蓄建議
                                    </Button>
                                </div>
                                <AdviceModal
                                    isModalVisible={isModalVisible}
                                    loading={loading}
                                    advice={advice}
                                    formatAdvice={formatAdvice}
                                    handleCancel={handleCancel}
                                    stocks={stocks}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default GeneralReport;
