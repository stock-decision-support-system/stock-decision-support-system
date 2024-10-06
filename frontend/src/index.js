import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/navbar';
import App from './pages/app';
import Login from './pages/login';
import SignUp from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import AddBankForm from './pages/addBankForm';
import Profile from './pages/profile';
import ResetPasswordPage from './pages/resetPassword';
import ChangePassword from './pages/changePassword';
import ManageUsers from './pages/manageUsers';
import InvestmentPerformance from './pages/investmentPerformance';
import InvestmentList from './pages/investmentList';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import { UserProvider } from './userContext';
import { AccountingProvider } from './context/AccountingContext'; // 引入 AccountingProvider
import AccountingForm from './pages/accounting';
import Stock from './pages/stock';
import GeneralReport from './pages/generalreport';
import StockList from './pages/stockList';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';
import TradeHistory from './pages/tradeHistory';


const root = createRoot(document.getElementById('root'));

root.render(
  <UserProvider>
    <AccountingProvider> {/* 包裹在這裡以確保共享的數據能夠在所有相關頁面使用 */}
      <Router>
        <React.StrictMode>
          <Navbar />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/bankForm" element={<AddBankForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/two-factor-auth" element={<TwoFactorAuthPage />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/manageUsers" element={<ManageUsers />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
            <Route path='/investmentPerformance' element={<InvestmentPerformance />} />
            <Route path='/investmentList' element={<InvestmentList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/accounting" element={<AccountingForm />} />
            <Route path="/two-factor-auth" element={<TwoFactorAuthPage />} />
            <Route path="/stock/:code" element={<Stock />} />
            <Route path="/generalreport" element={<GeneralReport />} />
            <Route path="/stockList" element={<StockList />} />
            <Route path="/tradeHistory" element={<TradeHistory />} />
          </Routes>
        </React.StrictMode>
      </Router>
    </AccountingProvider>
  </UserProvider>
);

// const rootScriptElement = document.createElement('div');
// rootScriptElement.id = 'root-script';
// document.body.appendChild(rootScriptElement);

// ReactDOM.render(
//   null,
//   document.getElementById('root-script')
// );
