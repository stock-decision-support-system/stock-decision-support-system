import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/Accounting.css';
import listIcon from '../assets/images/list.webp';
import { config } from "../config";
import { AccountingRequest } from '../api/request/accountingRequest.js';

const BASE_URL = config.API_URL;

const AccountingForm = () => {
  const [transactionDate, setTransactionDate] = useState('');
  const [amount, setAmount] = useState('');
  const [assetType, setAssetType] = useState('Cash');
  const [accountingName, setAccountingName] = useState('現金');
  const [content, setContent] = useState('');
  const [consumeTypeId, setConsumeTypeId] = useState('1');
  const [totalAmount, setTotalAmount] = useState(0);
  const [limit, setLimit] = useState(3000);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const maxTrades = 5;

  useEffect(() => {
    fetchTradeHistory();
    fetchTotalAmount();
  }, []);

  const fetchTradeHistory = () => {
    AccountingRequest.getAccountingList()
      .then(response => {
        setTradeHistory(response.data);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const fetchTotalAmount = () => {
    AccountingRequest.getFinancialSummary()
      .then(response => {
        setTotalAmount(response.data);
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!transactionDate) {
      alert('請選擇日期');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('金額欄位請輸入正數');
      return;
    }

    const newTrade = {
      consumeType_id: consumeTypeId, transactionDate, accountingName,
      assetType, amount: parseFloat(amount), content, createdId: localStorage.getItem('username')
    };
    AccountingRequest.addAccountingData(newTrade)
      .then(response => {
        alert(response.message)
        window.location.reload();
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  const handleSetLimit = () => {
    const newLimit = prompt('請輸入新的上限');
    if (!isNaN(newLimit) && newLimit > 0) {
      setLimit(parseFloat(newLimit));
    } else {
      alert('請輸入正確的數字');
    }
  };

  const handleAddAssetType = () => {
    const newAssetType = prompt('請輸入新的類別');
    if (newAssetType && newAssetType.trim() !== '') {
      setAssetType(newAssetType);
    }
  };

  const handleAddPayment = () => {
    const newPayment = prompt('請輸入新的支付方式');
    if (newPayment && newPayment.trim() !== '') {
      setAccountingName(newPayment);
    }
  };

  const updateProgressBar = () => {
    const progress = Math.min((totalAmount / limit) * 100, 100);
    return progress;
  };

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive);
  };

  return (
    <div className="kv w-100">
      <div className="container-all">
        <div className={`container-left ${isSidebarActive ? 'active' : ''}`}>
          <nav id="sliderbar" className={isSidebarActive ? 'active' : ''}>
            <button type="button" id="collapse" className="collapse-btn" onClick={toggleSidebar}>
              <img src={listIcon} alt="" width="40px" />
            </button>
            <ul className="list-unstyled">
              <h2 className="totalamounttitle">您的總資產</h2>
              <div className="totalamount">
                $ <span id="totalAmountDisplay">{totalAmount.toFixed(2)}</span>
              </div>
              <li>
                <a href="#">記帳</a>
              </li>
              <li>
                <a href="#sublist" data-bs-toggle="collapse" id="dropdown">報表查詢</a>
                <ul id="sublist" className="list-unstyled collapse">
                  <li>
                    <a href="#">總資產</a>
                  </li>
                  <li>
                    <a href="#">當日資產</a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        <div className={`container-right ${isSidebarActive ? 'collapsed' : ''}`}>
          <div className="account-form">
            <div className="account-form-container">
              <h2>記帳表格</h2>
              <form onSubmit={handleSubmit} id="accountForm">
                <label htmlFor="transactionDate">日期：</label>
                <Flatpickr
                  id="transactionDate"
                  value={transactionDate}
                  onChange={(selectedDates) => setTransactionDate(selectedDates[0])}
                  options={{
                    dateFormat: 'Y-m-d',
                  }}
                />
                <br /><br />
                <label htmlFor="amount">金額：</label>
                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} pattern="[0-9]*" title="請輸入數字" required /><br /><br />
                <label htmlFor="accountingName">支付方式：</label>
                <div className="payment-wrapper">
                  <select id="accountingName" value={accountingName} onChange={(e) => setAccountingName(e.target.value)} className="form-select">
                    <option value="現金">現金</option>
                    <option value="信用卡">信用卡</option>
                    <option value="銀行">銀行</option>
                    <option value="轉帳">轉帳</option>
                  </select>
                  <button type="button" onClick={handleAddPayment} className="btn btn-primary">新增支付方式</button>
                  <button type="button" className="btn btn-danger">刪除支付方式</button>
                </div><br />
                <label htmlFor="assetType">資產類型：</label>
                <div className="category-wrapper">
                  <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)} className="form-select">
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  <button type="button" onClick={handleAddAssetType} className="btn btn-primary">新增資產類型</button>
                  <button type="button" className="btn btn-danger">刪除資產類型</button>
                </div>
                <br />
                <label htmlFor="content">描述/備註：</label><br />
                <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="4" cols="50"></textarea><br /><br />
                <div className="type-wrapper">
                  <label htmlFor="consumeTypeId">類型：</label>
                  <input type="radio" id="income" name="consumeTypeId" value="1" checked={consumeTypeId === '1'} onChange={() => setConsumeTypeId('1')} />
                  <label htmlFor="1">收入</label>
                  <input type="radio" id="expense" name="consumeTypeId" value="2" checked={consumeTypeId === '2'} onChange={() => setConsumeTypeId('2')} />
                  <label htmlFor="2">支出</label>
                </div>
                <br /><br />
                <button type="submit">提交</button>
              </form>
            </div>
          </div>
          <div className="side-content">
            <div className="progress-container">
              <button className="progress-button" onClick={handleSetLimit}>設定上限</button>
              <div className="progress-bar">
                <div id="progressFill" className="progress-fill" style={{ width: `${updateProgressBar()}%`, backgroundColor: totalAmount <= 0 ? 'transparent' : '#3498db' }}></div>
              </div>
              <div id="currentTotal" className="progress-label">目前總資產：${totalAmount.toFixed(2)}</div>
              <div id="limitAmount" className="progress-label">上限：${limit.toFixed(2)}</div>
            </div>
            <div className="outertradehistory" id="outerTradeHistory">
              <div className="tradehistory-header">最近交易</div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">類型</th>
                    <th scope="col">日期</th>
                    <th scope="col">支付方式</th>
                    <th scope="col">資產類型</th>
                    <th scope="col">金額</th>
                  </tr>
                </thead>
                <tbody id="tradeHistoryBody">
                  {tradeHistory.map(trade => (
                    <tr key={trade.accountingId}>
                      <td>{trade.consumeType_id === '1' ? '收入' : '支出'}</td>
                      <td>{new Date(trade.transactionDate).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                      <td>{trade.accountingName}</td>
                      <td>{trade.assetType}</td>
                      <td>{trade.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="congratsModal" tabIndex="-1" aria-labelledby="congratsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="congratsModalLabel">恭喜</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              恭喜達到投資金額額度！
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingForm;
