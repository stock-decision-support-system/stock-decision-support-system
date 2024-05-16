import React from 'react';
import '../assets/css/BankDialog.css';
import { Button, Modal } from 'antd';

class BankItem extends React.Component {
  render() {
    const { bankName, region, branch, account, onModify, onDelete } = this.props;

    return (
      <div className="bank-item">
        <div className="bank-info">
          <h3>銀行名稱: {bankName}</h3>
          <div className="detail-left">
            <p>地區: {region}</p>
            <p>分行: {branch}</p>
          </div>
          <div className="detail-right">
            <p>帳號末四碼: {account}</p>
          </div>
        </div>
        <div className="button-group">
          <Button onClick={onModify}>修改</Button>
          <Button onClick={onDelete}>刪除</Button>
        </div>
      </div>
    );
  }
}

export default BankItem;