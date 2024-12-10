import React from "react";
import TestComponent from "../components/testComponent";
import "antd/dist/reset.css"; // 引入 Ant Design 樣式

const Test = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>測試頁面</h1>
      <TestComponent />
    </div>
  );
};

export default Test;
