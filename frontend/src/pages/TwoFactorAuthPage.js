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
  
    // 使用 login 函数设置用户状态
    login(username);
    localStorage.setItem('token', token);
    localStorage.removeItem('pending_username');
    localStorage.removeItem('pending_token');
  
    navigate('/'); // 跳转到登录后的首页
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
