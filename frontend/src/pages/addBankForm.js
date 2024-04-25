import React from 'react';
import BankDialog from '../components/bankDialog.js';
import { Card } from 'antd';

const AddBankForm = () => (
    <div className="position-absolute top-50 start-50 translate-middle kv w-75 h-50">
            <Card
                title={<h2>銀行資料</h2>}
                extra={<BankDialog>打開</BankDialog>}
            >
                <p>Card content</p>
                <p>Card content</p>
                <p>Card content</p>
            </Card>
    </div>
);
export default AddBankForm;
