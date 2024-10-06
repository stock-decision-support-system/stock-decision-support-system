import React, { useState, useEffect } from 'react'; // 引入React及其useState和useEffect hooks
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'antd/dist/reset.css'; // 引入 Ant Design 样式
import { Modal, Button, Select } from 'antd'; // 引入 Ant Design 組件
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import Sidebar from '../components/sidebar.js'; // 引入 Sidebar 組件
import '../assets/css/Accounting.css';
import { config } from "../config";
import { AccountingRequest } from '../api/request/accountingRequest.js'; // 引入AccountingRequest API請求模組
import { useAccounting } from '../context/AccountingContext'; // 引入 useAccounting 來更新全局總資產


const { Option } = Select; // Ant Design 的 Select 組件
const BASE_URL = config.API_URL;

const AccountingForm = () => {
  // 定義各種狀態變量
  const [transactionDate, setTransactionDate] = useState(''); // 交易日期
  const [amount, setAmount] = useState(''); // 金額
  const [assetType, setAssetType] = useState('Cash'); // 資產類型，默認為現金
  const [accountingName, setAccountingName] = useState('現金'); // 支付方式，默認為現金
  const [content, setContent] = useState(''); // 描述/備註
  const [consumeTypeId, setConsumeTypeId] = useState('1'); // 消費類型，1為收入，2為支出
  // const [totalAmount, setTotalAmount] = useState(0); // 總金額
  const [limit, setLimit] = useState(3000); // 金額上限
  const [tradeHistory, setTradeHistory] = useState([]); // 交易歷史
  const [monthlyData, setMonthlyData] = useState([]); // 月度數據
  const [isSidebarActive, setIsSidebarActive] = useState(false); // 側邊欄的狀態
  const maxTrades = 13; // 最大交易數量
  const [formType, setFormType] = useState('income'); // 控制表單類型的狀態（'income' 或 'expense'）
  const [incomeCategories, setIncomeCategories] = useState(['薪資', '獎金', '投資', '副業']);
  const [expenseCategories, setExpenseCategories] = useState(['飲食', '交通', '日常用品', '娛樂']);

  const [isModalVisible, setIsModalVisible] = useState(false); // 控制 Ant Design Modal 狀態

  const { totalAmount, setTotalAmount } = useAccounting(); // 使用 useAccounting 來取得和更新總資產


  useEffect(() => {
    fetchTradeHistory(); // 獲取交易歷史
    fetchTotalAmount(); // 獲取總金額
    // fetchMonthlyData(); // 獲取每月數據，原先要做月度數據
  }, []); // 只有在初次渲染時執行
  

  const fetchTradeHistory = () => {
    // 獲取交易歷史的API請求
    AccountingRequest.getAccountingList()
      .then(response => {
        const sortedHistory = response.data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
        setTradeHistory(sortedHistory); // 更新交易歷史狀態，按日期降序排序
        // 只顯示最近的 maxTrades 筆交易
        setTradeHistory(sortedHistory.slice(0, maxTrades));

        // // 計算月度數據
        // const calculatedMonthlyData = calculateMonthlyData(sortedHistory);
        // setMonthlyData(calculatedMonthlyData); // 更新月度數據

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

// 原先要做月度數據
//   const fetchMonthlyData = () => {
//     const currentYear = new Date().getFullYear();
//     const promises = [];

//     for (let month = 0; month < 12; month++) {
//       const startDate = new Date(currentYear, month, 1).toISOString().split('T')[0]; // 每月的第一天
//       const endDate = new Date(currentYear, month + 1, 0).toISOString().split('T')[0]; // 每月的最後一天

//       // 調用 API 並傳入 start_date 和 end_date
//       const promise = AccountingRequest.getFinancialSummary({
//         start_date: startDate,
//         end_date: endDate,
//         model_type: 'assets'
//       });

//       promises.push(promise);  // 將所有的請求放入 promises 中
//     }

//     // 等待所有 API 請求完成
//   Promise.all(promises)
//   .then(results => {
//     const data = results.map((result, index) => {
//       console.log(`Month: ${index + 1}, Response Data: `, result);  // 檢查API回應數據

//       return {
//         month: index + 1,
//         totalAmount: result.data || 0  // 確保讀取 `data` 的值
//       };
//     });
//     setMonthlyData(data);  // 更新月度數據
//   })
//   .catch(error => {
//     console.error('Error fetching monthly data:', error.message);
//   });
// };


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

        // 更新 tradeHistory 並限制最大顯示筆數
        setTradeHistory(prevTradeHistory => {
          const updatedHistory = [newTrade, ...prevTradeHistory]; // 新交易加在最前面
          if (updatedHistory.length > maxTrades) {
            updatedHistory.pop(); // 移除最後一筆交易，保證最多顯示 maxTrades 筆交易
          }
          return updatedHistory;
        });

        // 重新獲取並更新總資產
        AccountingRequest.getFinancialSummary()
          .then(response => {
            setTotalAmount(response.data); // 更新 AccountingContext 的總資產
          })
          .catch((error) => {
            alert(error.message); // 錯誤處理
          });

        // // 更新月度數據
        // const updatedMonthlyData = calculateMonthlyData([newTrade, ...tradeHistory]);
        // setMonthlyData(updatedMonthlyData);


        // 提交後刷新頁面，這裡可以選擇性移除這行以避免刷新整個頁面
        // window.location.reload();
      })
      .catch((error) => {
        alert(error.message); // 錯誤處理
      });
  };

  // const calculateMonthlyData = (tradeHistory) => {
  //   const monthlyData = {};

  //   tradeHistory.forEach(trade => {
  //     const month = new Date(trade.transactionDate).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' });

  //     if (!monthlyData[month]) {
  //       monthlyData[month] = 0;
  //     }

  //     if (trade.consumeType_id === '1') { // 收入
  //       monthlyData[month] += trade.amount;
  //     } else { // 支出
  //       monthlyData[month] -= trade.amount;
  //     }
  //   });

  //   return Object.keys(monthlyData).map(month => ({
  //     month,
  //     totalAmount: monthlyData[month]
  //   }));
  // };

  {/*const handleSetLimit = () => {
      const newLimit = prompt('請輸入新的上限');
      if (!isNaN(newLimit) && newLimit > 0) {
        setLimit(parseFloat(newLimit)); // 設定新的金額上限
      } else {
        alert('請輸入正確的數字');
      }
    };*/}

  const handleSetLimit = (option) => {
    if (option === 'naive') {
      setLimit(5000);
    } else if (option === 'buyAndHold') {
      setLimit(10000);
    }
    setIsModalVisible(false); // 選擇方案後關閉彈出視窗
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
      if (formType === 'income') {
        // 添加到收入類別
        setIncomeCategories([...incomeCategories, newPayment]);
      } else {
        // 添加到支出類別
        setExpenseCategories([...expenseCategories, newPayment]);
      }
    } else {
      alert('請輸入有效的支付方式');
    }
  };

  const handleDeletePayment = () => {
    // 獲取當前選中的消費類別
    const currentCategory = accountingName;

    // 提示使用者是否確認刪除
    const confirmDelete = window.confirm(`您是否確定要刪除 "${currentCategory}" 消費類別？`);

    if (confirmDelete) {
      if (formType === 'income') {
        // 從收入類別中刪除
        setIncomeCategories(incomeCategories.filter(category => category !== currentCategory));
      } else {
        // 從支出類別中刪除
        setExpenseCategories(expenseCategories.filter(category => category !== currentCategory));
      }

      // 刪除後，重新選擇一個類別（避免刪除後無選項的情況）
      if (formType === 'income') {
        setAccountingName(incomeCategories[0] || ''); // 如果還有其他選項，選擇第一個
      } else {
        setAccountingName(expenseCategories[0] || ''); // 如果還有其他選項，選擇第一個
      }
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
          {/* 使用 Sidebar 組件 */}
        <Sidebar isSidebarActive={isSidebarActive} toggleSidebar={toggleSidebar} />
        <div className={`accounting-container-right ${isSidebarActive ? 'collapsed' : ''}`}>
          <div className="accounting-account-form">
            <div className="accounting-account-form-container">
              <div className="form-type-buttons">
                <button
                  type="button"
                  className={`btn ${formType === 'income' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => {
                    setFormType('income');
                    setConsumeTypeId('1'); // 切換為收入表單
                  }}
                >
                  收入記帳
                </button>
                <button
                  type="button"
                  className={`btn ${formType === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => {
                    setFormType('expense');
                    setConsumeTypeId('2'); // 切換為支出表單
                  }}
                >
                  支出記帳
                </button>
              </div>

              <h2>{formType === 'income' ? '收入記帳表格' : '支出記帳表格'}</h2>
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
                <label htmlFor="accountingName">消費類別：</label>
                <div className="payment-wrapper">
                  <select id="accountingName" value={accountingName} onChange={(e) => setAccountingName(e.target.value)} className="form-select">
                    {/* 根據 formType 動態顯示消費類別 */}
                    {formType === 'income'
                      ? incomeCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                      : expenseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                  <button type="button" onClick={handleAddPayment} className="btn btn-primary">新增支付方式</button>
                  <button type="button" onClick={handleDeletePayment} className="btn btn-danger">刪除支付方式</button>
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
                {/*<div className="type-wrapper">
                    <label htmlFor="consumeTypeId">類型：</label>
                    <input type="radio" id="income" name="consumeTypeId" value="1" checked={consumeTypeId === '1'} onChange={() => setConsumeTypeId('1')} />
                    <label htmlFor="1">收入</label>
                    <input type="radio" id="expense" name="consumeTypeId" value="2" checked={consumeTypeId === '2'} onChange={() => setConsumeTypeId('2')} />
                    <label htmlFor="2">支出</label>
                  </div>*/}
                <br /><br />
                <button type="submit">提交</button>
              </form>
            </div>
          </div>
          <div className="accounting-side-content">
            <div className="accounting-progress-container">
              <button className="accounting-progress-button" onClick={() => setIsModalVisible(true)}>設定上限</button>
              <div className="accounting-progress-bar">
                <div id="progressFill" className="accounting-progress-fill" style={{ width: `${updateProgressBar()}%`, backgroundColor: totalAmount <= 0 ? 'transparent' : '#3498db' }}></div>
              </div>
              <div id="accounting-currentTotal" className="accounting-progress-label">目前總資產：${totalAmount.toFixed(2)}</div>
              <div id="accounting-limitAmount" className="accounting-progress-label">上限：${limit.toFixed(2)}</div>
            </div>
            {/* Ant Design Modal 彈出視窗 */}
            <Modal
              title="選擇投資方案"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={[
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  取消
                </Button>
              ]}
            >
              <p>請選擇一種投資方案：</p>
              <Button type="primary" onClick={() => handleSetLimit('naive')}>
                Naive（上限：5000）
              </Button>
              <Button type="success" onClick={() => handleSetLimit('buyAndHold')} style={{ marginLeft: '10px' }}>
                Buy and Hold（上限：10000）
              </Button>
            </Modal>
            <div className="accounting-outertradehistory" id="outerTradeHistory">
              <div className="accounting-tradehistory-header">最近交易</div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">類型</th>
                    <th scope="col">日期</th>
                    <th scope="col">消費類別</th>
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
