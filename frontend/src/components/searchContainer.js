import React from 'react';

const SearchContainer = () => {
  return (
    <div className="search-container">
      <input type="text" id="stockSymbol" placeholder="輸入股票代號" />
      <button id="searchButton">🔍</button>
      <button id="filterButton">股類篩選</button>
    </div>
  );
};

export default SearchContainer;
