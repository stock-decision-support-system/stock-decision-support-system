import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchContainer = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (code) {
      navigate(`/stock/${code}`);
    } else {
      alert('請輸入股票代號');
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
      />
      <button id="searchButton" onClick={handleSearch}>
        🔍
      </button>
      <button id="filterButton">股類篩選</button>
    </div>
  );
};

export default SearchContainer;
