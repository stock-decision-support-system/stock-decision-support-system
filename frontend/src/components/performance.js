import React from 'react';
import '../assets/css/investmentPerformance.css';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const Performance = ({ value, percentage }) => {
  const isGain = value >= 0;
  return (
    <span className={isGain ? 'gain' : 'loss'}>
      {isGain ? <ArrowUpOutlined className="arrow-up" /> : <ArrowDownOutlined className="arrow-down" />}
      {Math.abs(value).toFixed(2)} ({Math.abs(percentage).toFixed(2)}%)
    </span>
  );
};

export default Performance;