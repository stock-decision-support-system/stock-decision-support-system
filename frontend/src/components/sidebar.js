import React from 'react';
import listIcon from '../assets/images/list.webp';
import { useAccounting } from '../context/AccountingContext'; // 引入 useAccounting hook
import '../assets/css/sidebar.css'; // 引入樣式

const Sidebar = ({ isSidebarActive, toggleSidebar }) => {
  const { totalAmount } = useAccounting(); // 從 useAccounting 中獲取總資產

  return (
    <div className={`accounting-container-left ${isSidebarActive ? 'active' : ''}`}>
      <nav id="accounting-sliderbar" className={isSidebarActive ? 'active' : ''}>
        <button type="button" id="accounting-collapse" className="accounting-collapse-btn" onClick={toggleSidebar}>
          <img src={listIcon} alt="" width="40px" />
        </button>
        <ul className="accounting-list-unstyled">
          <h2 className="accounting-totalamounttitle">您的總資產</h2>
          <div className="accounting-totalamount">
            $ <span id="totalAmountDisplay">{totalAmount.toFixed(2)}</span> {/* 動態顯示總資產 */}
          </div>
          <li>
            <a href="/accounting">記帳</a>
          </li>
          <li>
            <a href="#sublist" data-bs-toggle="collapse" id="dropdown">報表查詢</a>
            <ul id="sublist" className="list-unstyled collapse">
              <li>
                <a href='/generalreport'>總資產</a>
              </li>
              <li>
                <a href="#">當日資產</a>
              </li>
            </ul>
          </li>
          <li>
            <a href="/tradeHistory">交易查詢</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
