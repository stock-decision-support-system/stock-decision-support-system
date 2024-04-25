import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './assets/css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/navbar';
import App from './pages/app.js';
import AddBankForm from './pages/addBankForm.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';

const root = createRoot(document.getElementById('root'));

root.render(
  <Router>
    <React.StrictMode>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/test" element={<AddBankForm />} />
      </Routes>
    </React.StrictMode>
  </Router>,
);

const rootScriptElement = document.createElement('div');
rootScriptElement.id = 'root-script';
document.body.appendChild(rootScriptElement);

ReactDOM.render(
  null,
  document.getElementById('root-script')
);
