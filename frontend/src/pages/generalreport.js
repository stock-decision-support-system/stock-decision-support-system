import React, { useState, useEffect } from 'react';
import { message, Card, DatePicker, Button } from 'antd';
import { DualAxes } from '@ant-design/plots';
import { AccountingRequest } from '../api/request/accountingRequest';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件
import adviceImage from '../assets/images/advice.png';
import '../assets/css/generalreport.css';
import { FinancialAnalysisRequest } from '../api/request/financialAnalysisRequest.js';
import axios from 'axios';
import { config } from "../config";
const BASE_URL = config.API_URL;

const { RangePicker } = DatePicker;

const GeneralReport = () => {
    const [totalAmount, setTotalAmount] = useState(0);
    const [netAmount, setNetAmount] = useState(0);
    const [aIAdviceArray, setAIAdviceArray] = useState([]);
    const [advice, setAdvice] = useState('')
    const [visibleAdvice, setVisibleAdvice] = useState(1); // 用於追蹤可見的建議數量
    const [totalLength, setTotalLength] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [selectedDates, setSelectedDates] = useState([null, null]); // 儲存選擇的日期範圍

    useEffect(() => {
        fetchTotalAmount();
        fetchAIAdvice();
        handleFetchData();
    }, []);

    const splitAIAdvice = (text) => {
        const paragraphs = text.split('\n\n').map(item => item.trim());
        const result = [];

        paragraphs.forEach(paragraph => {
            if (paragraph.length > 75) {
                // 如果段落長度超過 75，則再分割
                const splitParagraphs = paragraph.match(/.{1,75}/g) || []; // 每 75 字一段
                result.push(...splitParagraphs);
            } else {
                // 如果段落長度不超過 75，則直接加入
                result.push(paragraph);
            }
        });
        setTotalLength(result.length);
        return result;
    };

    const fetchAIAdvice = async () => {
        FinancialAnalysisRequest.getAccountingAI()
            .then(response => {
                setAdvice(response.data[0].advice);
                setAIAdviceArray(splitAIAdvice(response.data[0].advice));
            })
            .catch((error) => {
                message.error(error.message);
            });
    }

    useEffect(() => {
        if (totalLength !== null) {
            // 每 4 秒顯示一個新段落
            const interval = setInterval(() => {
                setVisibleAdvice(prev => Math.min(prev + 1, aIAdviceArray.length)); // 增加可見建議的數量
            }, 4000); // 每 4 秒執行一次

            return () => clearInterval(interval); // 清除定時器
        }
    }, [totalLength, aIAdviceArray]);

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


    return (
        <div className="w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} netAmount={netAmount} selectedKey={'3'} />
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
                                    <img
                                        src={adviceImage}
                                        alt="ai建議"
                                        style={{ height: '150px' }}
                                    />
                                    <h3 style={{
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}>
                                        AI儲蓄建議
                                    </h3>
                                </div>
                                <Card
                                    style={{
                                        margin: '1rem',
                                        width: '90%',
                                        overflowX: 'hidden', // 禁用水平滑軌
                                        overflowY: 'auto', // 讓內容超出時顯示垂直滑軌
                                        maxHeight: '150px', // 設定最大高度
                                        textAlign: 'left', // 讓文字靠左
                                    }}
                                >
                                    {aIAdviceArray.slice(0, visibleAdvice).map((advice, index) => (
                                        <p className="typewriter" key={index}>{advice}</p>
                                    ))}
                                </Card>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default GeneralReport;
