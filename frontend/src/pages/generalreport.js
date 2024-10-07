import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/generalreport.css';
import { Line } from '@ant-design/charts';
import AccountingSidebar from '../components/accountingSidebar.js'; // 引入 Sidebar 組件

const GeneralReport = () => {
    const [category, setCategory] = useState('全年');
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0)

    const toggleSidebar = () => {
        setIsSidebarActive(!isSidebarActive);
    };

    // 假資料，用於折線圖
    const data = [
        { month: '2024-01', value: 100 },
        { month: '2024-02', value: 105 },
        { month: '2024-03', value: 110 },
        { month: '2024-04', value: 120 },
        { month: '2024-05', value: 130 },
        { month: '2024-06', value: 140 },
        { month: '2024-07', value: 150 },
        { month: '2024-08', value: 160 },
        { month: '2024-09', value: 170 },
        { month: '2024-10', value: 180 },
        { month: '2024-11', value: 190 },
        { month: '2024-12', value: 200 },
    ];

    const config = {
        data,
        xField: 'month',
        yField: 'value',
        smooth: true,
        label: {
            style: {
                fill: '#aaa',
            },
        },
        point: {
            size: 5,
            shape: 'diamond',
        },
        tooltip: {
            showMarkers: true,
        },
        title: {
            visible: true,
            text: '全年度每月總資產 折線圖',
        },
        xAxis: {
            title: {
                text: '月份',
            },
        },
        yAxis: {
            title: {
                text: '資產價值',
            },
            min: 0,
        },
        autoFit: true, // 禁用自動適應
    };

    return (
        <div className="generalreport-kv w-100" style={{ height: '80%', display: 'flex' }}>
            <AccountingSidebar totalAmount={totalAmount} selectedKey={'2'}/>
            <div className="generalreport-container-all">
                {/* 使用 Sidebar 組件 */}
                <div className="generalreport-container-right">
                    <div className="generalreport-account-form">
                        <div className="generalreport-dropdown-container">
                            <select id="category" name="category" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="全年">全年</option>
                                <option value="前半年">前半年</option>
                                <option value="後半年">後半年</option>
                                <option value="近三個月">近三個月</option>
                            </select>
                        </div>
                        <div className="generalreport-report-container">
                            <div className="chart-container">
                                {/* 用 Ant Design Charts 的 Line 組件來顯示折線圖 */}
                                <Line {...config} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralReport;
