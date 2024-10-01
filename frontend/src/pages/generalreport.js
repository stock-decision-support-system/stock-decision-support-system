import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/generalreport.css';
import listIcon from '../assets/images/list.webp';
import { Line } from '@ant-design/charts';

const GeneralReport = () => {
    const [category, setCategory] = useState('全年');
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

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
    };

    return (
        <div className="generalreport-kv w-100">
            <div className="generalreport-container-all">
                <div className={`generalreport-container-left ${isSidebarActive ? 'active' : ''}`}>
                    <nav id="generalreport-sidebar" className={isSidebarActive ? 'active' : ''}>
                        <button type="button" id="collapse" className="generalreport-collapse-btn" onClick={toggleSidebar}>
                            <img src={listIcon} alt="" width="40px" />
                        </button>
                        <ul className="generalreport-list-unstyled">
                            <h2 className="generalreport-totalamounttitle">您的總資產</h2>
                            <div className="generalreport-totalamount">
                                $ <span id="totalAmountDisplay">{totalAmount.toFixed(2)}</span>
                            </div>
                            <li>
                                <a href="/accounting">記帳</a>
                            </li>
                            <li>
                                <a href="#generalreport-sublist" data-bs-toggle="collapse" id="generalreport-dropdown">報表查詢</a>
                                <ul id="generalreport-sublist" className="list-unstyled collapse">
                                    <li>
                                        <a href='/generalreport'>總資產</a>
                                    </li>
                                    <li>
                                        <a href="#">當日資產</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>

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
                            {/* 用 Ant Design Charts 的 Line 組件來顯示折線圖 */}
                            <Line {...config} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralReport;
