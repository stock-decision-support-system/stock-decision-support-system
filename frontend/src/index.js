import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/navbar';
import App from './pages/app.js';
import Login from './pages/login';
import SignUp from './pages/signUp.js';
import ForgotPassword from './pages/forgotPassword.js';
import AddBankForm from './pages/addBankForm.js';
import Profile from './pages/profile.js';
import ResetPasswordPage from './pages/resetPassword.js';
import ChangePassword from './pages/changePassword.js';
import ManageUsers from './pages/manageUsers.js';
import InvestmentPerformance from './pages/investmentPerformance.js';
import InvestmentList from './pages/investmentList.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import { UserProvider } from './userContext.js';
import AccountingForm from './pages/accounting.js';
import Stock from './pages/stock.js';

const root = createRoot(document.getElementById('root'));

root.render(
  <UserProvider> {/* 使用 UserProvider 包裹應用 */}
    <Router>
      <React.StrictMode>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<App />} />
          <Route path="/bankForm" element={<AddBankForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/manageUsers" element={<ManageUsers />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path='/investmentPerformance' element={<InvestmentPerformance/>}/>
          <Route path='/investmentList' element={<InvestmentList/>}/>
          <Route path="/profile" element={<Profile />} />
          <Route path="/accounting" element={<AccountingForm />} />
          <Route path="/stock" element={<Stock />} />
        </Routes>
      </React.StrictMode>
    </Router>,
  </UserProvider>
);

const rootScriptElement = document.createElement('div');
rootScriptElement.id = 'root-script';
document.body.appendChild(rootScriptElement);

ReactDOM.render(
  null,
  document.getElementById('root-script')
);
