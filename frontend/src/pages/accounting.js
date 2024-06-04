import React, { useState, useEffect } from 'react'; // 引入React及其useState和useEffect hooks
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/Accounting.css';
import listIcon from '../assets/images/list.webp';
import { config } from "../config";
import { AccountingRequest } from '../api/request/accountingRequest.js'; // 引入AccountingRequest API請求模組

const BASE_URL = config.API_URL;

const AccountingForm = () => {
  // 定義各種狀態變量
  const [transactionDate, setTransactionDate] = useState(''); // 交易日期
  const [amount, setAmount] = useState(''); // 金額
  const [assetType, setAssetType] = useState('Cash'); // 資產類型，默認為現金
  const [accountingName, setAccountingName] = useState('現金'); // 支付方式，默認為現金
  const [content, setContent] = useState(''); // 描述/備註
  const [consumeTypeId, setConsumeTypeId] = useState('1'); // 消費類型，1為收入，2為支出
  const [totalAmount, setTotalAmount] = useState(0); // 總金額
  const [limit, setLimit] = useState(3000); // 金額上限
  const [tradeHistory, setTradeHistory] = useState([]); // 交易歷史
  const [isSidebarActive, setIsSidebarActive] = useState(false); // 側邊欄的狀態
  const maxTrades = 5; // 最大交易數量

  useEffect(() => {
    fetchTradeHistory(); // 獲取交易歷史
    fetchTotalAmount(); // 獲取總金額
  }, []); // 只有在初次渲染時執行

  const fetchTradeHistory = () => {
    // 獲取交易歷史的API請求
    AccountingRequest.getAccountingList()
      .then(response => {
        setTradeHistory(response.data); // 更新交易歷史狀態
      })
      .catch((error) => {
        alert(error.message); // 錯誤處理
      });
  };

  const fetchTotalAmount = () => {
    // 獲取總金額的API請求
    AccountingRequest.getFinancialSummary()
      .then(response => {
        setTotalAmount(response.data); // 更新總金額狀態
      })
      .catch((error) => {
        alert(error.message); // 錯誤處理
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // 防止表單默認提交行為
    if (!transactionDate) {
      alert('請選擇日期');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('金額欄位請輸入正數');
      return;
    }
    // consumeType_id = 收入or支出,transactionDate = 交易新增時間,accountingName=支付方式, assetType=資產類型,amount=金額,content=備註,createdId=使用者ID
    const newTrade = {
      consumeType_id: consumeTypeId, transactionDate, accountingName,
      assetType, amount: parseFloat(amount), content, createdId: localStorage.getItem('username')
    };
    // 添加新的交易記錄
    AccountingRequest.addAccountingData(newTrade)
      .then(response => {
        alert(response.message)
        window.location.reload(); // 提交後刷新頁面
      })
      .catch((error) => {
        alert(error.message); // 錯誤處理
      });
  };

  const handleSetLimit = () => {
    const newLimit = prompt('請輸入新的上限');
    if (!isNaN(newLimit) && newLimit > 0) {
      setLimit(parseFloat(newLimit)); // 設定新的金額上限
    } else {
      alert('請輸入正確的數字');
    }
  };

  const handleAddAssetType = () => {
    const newAssetType = prompt('請輸入新的類別');
    if (newAssetType && newAssetType.trim() !== '') {
      setAssetType(newAssetType); // 添加新的資產類型
    }
  };

  const handleAddPayment = () => {
    const newPayment = prompt('請輸入新的支付方式');
    if (newPayment && newPayment.trim() !== '') {
      setAccountingName(newPayment); // 添加新的支付方式
    }
  };

  const updateProgressBar = () => {
    const progress = Math.min((totalAmount / limit) * 100, 100); // 計算進度條進度
    return progress;
  };

  const toggleSidebar = () => {
    setIsSidebarActive(!isSidebarActive); // 切換側邊欄的狀態
  };

  

  return (
    <div className="accounting-kv w-100">
      <div className="accounting-container-all">
        <div className={`accounting-container-left ${isSidebarActive ? 'active' : ''}`}>
          <nav id="accounting-sliderbar" className={isSidebarActive ? 'active' : ''}>
            <button type="button" id="accounting-collapse" className="accounting-collapse-btn" onClick={toggleSidebar}>
              <img src={listIcon} alt="" width="40px" />
            </button>
            <ul className="accounting-list-unstyled">
              <h2 className="accounting-totalamounttitle">您的總資產</h2>
              <div className="accounting-totalamount">
                $ <span id="totalAmountDisplay">{totalAmount.toFixed(2)}</span>
              </div>
              <li>
                <a href="#">記帳</a>
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
            </ul>
          </nav>
        </div>
        <div className={`accounting-container-right ${isSidebarActive ? 'collapsed' : ''}`}>
          <div className="accounting-account-form">
            <div className="accounting-account-form-container">
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
          <div className="accounting-side-content">
            <div className="accounting-progress-container">
              <button className="accounting-progress-button" onClick={handleSetLimit}>設定上限</button>
              <div className="accounting-progress-bar">
                <div id="progressFill" className="accounting-progress-fill" style={{ width: `${updateProgressBar()}%`, backgroundColor: totalAmount <= 0 ? 'transparent' : '#3498db' }}></div>
              </div>
              <div id="accounting-currentTotal" className="accounting-progress-label">目前總資產：${totalAmount.toFixed(2)}</div>
              <div id="accounting-limitAmount" className="accounting-progress-label">上限：${limit.toFixed(2)}</div>
            </div>
            <div className="accounting-outertradehistory" id="outerTradeHistory">
              <div className="accounting-tradehistory-header">最近交易</div>
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
      {/* <div className="modal fade" id="congratsModal" tabIndex="-1" aria-labelledby="congratsModalLabel" aria-hidden="true">
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
      </div> */}
    </div>
  );
};

export default AccountingForm;
