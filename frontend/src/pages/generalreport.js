import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/generalreport.css';
//import Chart from 'chart.js/auto';
import $ from 'jquery';
import fakeChart from '../assets/images/generalreport.png';
import listIcon from '../assets/images/list.webp';

const GeneralReport = () => {
    const [category, setCategory] = useState('全年');
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    //const sidebarRef = useRef(null);
    //const sublistRef = useRef(null);
    //const lineChartRef = useRef(null);

    
  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

    /*
    useEffect(() => {
        const fullData = {
            labels: [
                '2024-01', '2024-02', '2024-03', '2024-04', '2024-05',
                '2024-06', '2024-07', '2024-08', '2024-09', '2024-10',
                '2024-11', '2024-12'
            ],
            datasets: [{
                label: '總資產',
                data: [100, 105, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.1
            }]
        };

        const ctx = lineChartRef.current.getContext('2d');
        const lineChart = new Chart(ctx, {
            type: 'line',
            data: fullData,
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: '全年度每月總資產 折線圖'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '月份'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '資產價值'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        const updateChart = (category) => {
            let updatedData;

            if (category === '全年') {
                updatedData = {
                    labels: fullData.labels,
                    datasets: fullData.datasets
                };
            } else if (category === '前半年') {
                updatedData = {
                    labels: fullData.labels.slice(0, 6),
                    datasets: [{
                        label: '總資產',
                        data: fullData.datasets[0].data.slice(0, 6),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                };
            } else if (category === '後半年') {
                updatedData = {
                    labels: fullData.labels.slice(6, 12),
                    datasets: [{
                        label: '總資產',
                        data: fullData.datasets[0].data.slice(6, 12),
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                };
            } else if (category === '近三個月') {
                const currentMonthIndex = new Date().getMonth();
                const labels = [];
                const data = [];

                for (let i = 2; i >= 0; i--) {
                    const index = (currentMonthIndex - i + 12) % 12;
                    labels.push(fullData.labels[index]);
                    data.push(fullData.datasets[0].data[index]);
                }

                updatedData = {
                    labels: labels,
                    datasets: [{
                        label: '總資產',
                        data: data,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: false,
                        tension: 0.1
                    }]
                };
            }

            lineChart.data = updatedData;
            lineChart.update();
        };

        updateChart(category);

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                sidebarRef.current.classList.remove('active');
                sublistRef.current.style.display = 'none';
            } else {
                if (!sidebarRef.current.classList.contains('active')) {
                    sublistRef.current.style.display = 'none';
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            lineChart.destroy();
        };
    }, [category]); */

   useEffect(() => {
       $("#generalreport-collapse").on("click", function () {
           if ($(window).width() < 768) {
               $("#generalreport-sidebar ul").slideToggle();
               $("#generalreport-sublist").hide();
           } else {
               $("#generalreport-sidebar").toggleClass("active");
               $(".generalreport-container-right").toggleClass("collapsed");
           }
       });

       $("#generalreport-dropdown").on("click", function () {
           $("#generalreport-sublist").slideToggle();
       });
   }, []);
   

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
                            {/* <p>報表(折線圖最佳)</p> */}
                            {/* <canvas id="lineChart" ref={lineChartRef}></canvas> */}
                            <img src={fakeChart} alt="K線圖報表" style={{ width: "100%", maxWidth: "100%" }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralReport;
