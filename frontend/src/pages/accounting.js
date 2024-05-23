import React, { useState, useEffect } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '../assets/css/Accounting.css';

const AccountingForm = () => {
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('飲食');
  const [payment, setPayment] = useState('現金');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('income');
  const [totalAmount, setTotalAmount] = useState(0);
  const [limit, setLimit] = useState(3000);
  const [tradeHistory, setTradeHistory] = useState([]);
  const maxTrades = 5;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!date) {
      alert('請選擇日期');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      alert('金額欄位請輸入正數');
      return;
    }
    const newAmount = parseFloat(amount);
    const newTotalAmount = type === 'income' ? totalAmount + newAmount : totalAmount - newAmount;
    setTotalAmount(newTotalAmount);

    const newTrade = { type, date, category, payment, amount: newAmount };
    setTradeHistory([newTrade, ...tradeHistory.slice(0, maxTrades - 1)]);
    setDate('');
    setAmount('');
    setDescription('');
    setCategory('飲食');
    setPayment('現金');
  };

  const handleSetLimit = () => {
    const newLimit = prompt('請輸入新的上限');
    if (!isNaN(newLimit) && newLimit > 0) {
      setLimit(parseFloat(newLimit));
    } else {
      alert('請輸入正確的數字');
    }
  };

  const handleAddCategory = () => {
    const newCategory = prompt('請輸入新的類別');
    if (newCategory && newCategory.trim() !== '') {
      setCategory(newCategory);
    }
  };

  const handleAddPayment = () => {
    const newPayment = prompt('請輸入新的支付方式');
    if (newPayment && newPayment.trim() !== '') {
      setPayment(newPayment);
    }
  };

  const updateProgressBar = () => {
    const progress = Math.min((totalAmount / limit) * 100, 100);
    return progress;
  };

  return (
    <div className="kv w-100">
      <div className="container-all">
        <div className="container-left">
          <nav id="sliderbar">
            <button type="button" id="collapse" className="collapse-btn">
              <img src="images/list.webp" alt="" width="40px" />
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
        <div className="container-right">
          <div className="account-form">
            <div className="account-form-container">
              <h2>記帳表格</h2>
              <form onSubmit={handleSubmit} id="accountForm">
                <label htmlFor="date">日期：</label>
                <Flatpickr
                  id="date"
                  value={date}
                  onChange={(selectedDates) => setDate(selectedDates[0])}
                  options={{
                    dateFormat: 'Y-m-d',
                  }}
                />
                <br /><br />
                <label htmlFor="amount">金額：</label>
                <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} pattern="[0-9]*" title="請輸入數字" required /><br /><br />
                <label htmlFor="category">類別：</label>
                <div className="category-wrapper">
                  <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
                    <option value="飲食">飲食</option>
                    <option value="交通">交通</option>
                    <option value="娛樂">娛樂</option>
                    <option value="日常用品">日常用品</option>
                    <option value="水電瓦斯">水電瓦斯</option>
                    <option value="電話網路">電話網路</option>
                    <option value="服飾">服飾</option>
                    <option value="汽機車">汽機車</option>
                    <option value="醫療保險">醫療保險</option>
                  </select>
                  <button type="button" onClick={handleAddCategory} className="btn btn-primary">新增類別</button>
                  <button type="button" className="btn btn-danger">刪除類別</button>
                </div><br />
                <label htmlFor="payment">支付方式：</label>
                <div className="payment-wrapper">
                  <select id="payment" value={payment} onChange={(e) => setPayment(e.target.value)} className="form-select">
                    <option value="現金">現金</option>
                    <option value="信用卡">信用卡</option>
                    <option value="電子支付">電子支付</option>
                    <option value="金融卡">金融卡</option>
                  </select>
                  <button type="button" onClick={handleAddPayment} className="btn btn-primary">新增支付方式</button>
                  <button type="button" className="btn btn-danger">刪除支付方式</button>
                </div><br />
                <label htmlFor="description">描述/備註：</label><br />
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" cols="50"></textarea><br /><br />
                <div className="type-wrapper">
                  <label htmlFor="type">類型：</label>
                  <input type="radio" id="income" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} />
                  <label htmlFor="income">收入</label>
                  <input type="radio" id="expense" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} />
                  <label htmlFor="expense">支出</label>
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
                    <th scope="col">類別</th>
                    <th scope="col">支付方式</th>
                    <th scope="col">金額</th>
                  </tr>
                </thead>
                <tbody id="tradeHistoryBody">
                  {tradeHistory.map((trade, index) => (
                    <tr key={index}>
                      <td>{trade.type === 'income' ? '收入' : '支出'}</td>
                      <td>{trade.date}</td>
                      <td>{trade.category}</td>
                      <td>{trade.payment}</td>
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
