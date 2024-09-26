import React, { useState, useEffect } from 'react';
import { Stock } from '@ant-design/plots';
import { Radio } from 'antd';
import { config } from "../config";
import axios from 'axios';

const API_URL = config.API_URL;

const KBar = ({ id }) => {
    const [data, setData] = useState([]);
    const [type, setType] = useState('2');

    const typeChange = (e) => {
        setType(e.target.value);
        fetchStockData(e.target.value);
    };

    const formatKBarData = (rawData) => {
        return Object.keys(rawData).map((key) => {
            const [timestamp, open, high, low, close, volume] = rawData[key];
            return {
                date: getDate(timestamp),
                open,
                high,
                low,
                close,
                volume,
            };
        });
    };

    const fetchStockData = async (changeType) => {
        try {
            const response = await axios.get(`${API_URL}/stock/kbar/${id}/?type=${changeType}`);
            const kbarData = response.data.data;

            const formattedData = formatKBarData(kbarData);
            setData(formattedData);
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchStockData(type);
    }, []);

    const getDate = (ts) => {
        const millisecondsTimestamp = ts / 1e6;
        const date = new Date(millisecondsTimestamp);
        const getDay = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0') + ' ' +
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0') + ':' +
            String(date.getSeconds()).padStart(2, '0');
        return getDay
    };

    const config = {
        appendPadding: [0, 10, 0, 0],
        xField: 'date',
        yField: ['open', 'close', 'high', 'low'],
        data: data,
        meta: {
            open: {
                alias: '開盤價',
                formatter: (v) => v.toFixed(2),  // 限制小數點到兩位
            },
            close: {
                alias: '收盤價',
                formatter: (v) => v.toFixed(2),
            },
            high: {
                alias: '最高價',
                formatter: (v) => v.toFixed(2),
            },
            low: {
                alias: '最低價',
                formatter: (v) => v.toFixed(2),
            },
            date: { alias: '日期' },
        },
        slider: {},
    };

    return (
        <>
            <div className="clearfix">
                <div className="float-end mb-2">
                    <Radio.Group value={type} onChange={typeChange}>
                        <Radio.Button value="0">月</Radio.Button>
                        <Radio.Button value="1">週</Radio.Button>
                        <Radio.Button value="2">日</Radio.Button>
                    </Radio.Group>
                </div>
            </div>
            <Stock {...config} />
        </>
    );
};

export default KBar;