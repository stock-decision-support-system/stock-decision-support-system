import React from 'react';
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
import AccountingForm from './pages/accounting';
import Stock from './pages/stock';
import GeneralReport from './pages/generalreport';
import StockList from './pages/stockList';
import TwoFactorAuthPage from './pages/twoFactorAuthPage';
import TradeHistory from './pages/tradeHistory';

const root = createRoot(document.getElementById('root'));

root.render(
  <UserProvider>
    <Router>
      <React.StrictMode>
        <Navbar />
        <div className='d-flex justify-content-center align-items-center vh-100'>
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
            <Route path="/portfolio/:id" element={<InvestmentPerformance />} />
            <Route path='/investmentList' element={<InvestmentList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/stock/:code" element={<Stock />} />
            <Route path="/stockList" element={<StockList />} />
            <Route path="/accounting" element={<AccountingForm />} />
            <Route path="/generalreport" element={<GeneralReport />} />
            <Route path="/tradeHistory" element={<TradeHistory />} />
          </Routes>
        </div>
      </React.StrictMode>
    </Router>
  </UserProvider>
);
