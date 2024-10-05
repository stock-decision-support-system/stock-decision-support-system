import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TwoFactorAuth from '../components/TwoFactorAuth';
import { useUser } from '../userContext';  // 引入 useUser 钩子

const TwoFactorAuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useUser();  // 获取 login 函数
  const email = location.state?.email;

  const handleVerificationSuccess = async () => {
    const username = localStorage.getItem('pending_username');
    const token = localStorage.getItem('pending_token');

    // 確認 pending_token 存在並非 null
    if (token) {
      // 使用 login 函數設置用戶狀態
      login(username);
      localStorage.setItem('token', token);  // 將 token 設置到 localStorage
      localStorage.setItem('username', username);
      localStorage.removeItem('pending_username');
      localStorage.removeItem('pending_token');

      // 驗證成功，導航到首頁
      navigate('/');
    } else {
      console.error('無法獲取驗證後的 token');
      alert('驗證失敗，請重新登入');
    }
  };


  return (

    <div className="kv w-100">
      <div className="User">
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center h-100 pt-5">
            <div className="col-md-4" style={{ backgroundColor: 'rgba(232, 180, 188, 0.65)' }}>
              <h2 className='fw-bold d-flex justify-content-center pt-4 pb-3'>二段式驗證</h2>
              <p className='d-flex justify-content-center mb-4'>驗證碼已發送至 {email}，請輸入驗證碼進行登入</p>
              <TwoFactorAuth email={email} onSuccess={handleVerificationSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthPage;
