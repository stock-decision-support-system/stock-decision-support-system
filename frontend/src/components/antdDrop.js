import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, message, Space } from 'antd';
import '../assets/css/index.css';
import { AiFillSetting } from "react-icons/ai";

const AntdDrop = ({ items }) => {
  const onClick = ({ key }) => {
    message.info(`Click on item ${key}`);
  };

  return (
    <Dropdown
      className="nav-link"
      style={{ color: '#C0C2C6' }}
      menu={{
        items,
        onClick,
      }}
    >
      <a onClick={(e) => e.preventDefault()}>
        <AiFillSetting style={{ fontSize: '20px' }} />
      </a>
    </Dropdown>
  );
};

export default AntdDrop;
