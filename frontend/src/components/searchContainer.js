import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

const SearchContainer = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  // 搜尋股票代號的函式
  const handleSearch = () => {
    if (code) {
      navigate(`/stock/${code}`);
    } else {
      alert('請輸入股票代號');
    }
  };

  // 偵測按下的按鍵，若為 Enter 則執行搜尋
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        id="code"
        placeholder="輸入股票代號"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button id="searchButton" type="primary" className="ms-auto button2" onClick={handleSearch} style={{ 'height': '3em' }}>
        搜尋
      </Button>
    </div >
  );
};

export default SearchContainer;
