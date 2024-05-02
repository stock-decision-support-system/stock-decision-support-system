import React from 'react';
import BankDialog from '../components/bankDialog.js';
import { Card } from 'antd';
import BankItem from '../components/bankItem.js';

const banks = [
    { bankName: '中國信託商業銀行', fullName: '中*', region: '台北市', branch: '大安分行', id: 5357 },
    { bankName: '中國信託商業銀行', fullName: '中*', region: '台北市', branch: '大安分行', id: 53572 },
];

const AddBankForm = () => (

    <div className="position-absolute top-50 start-50 translate-middle kv w-75 h-50">
        <Card
            title={<h1 className='pt-2'>銀行資料</h1>}
            extra={<BankDialog>打開</BankDialog>}
            className='h-100'
        >
            {banks.map(bank => (
                <BankItem
                    key={bank.id}
                    bankName={bank.bankName}
                    fullName={bank.fullName}
                    region={bank.region}
                    branch={bank.branch}
                    account={bank.id}
                    onModify={() => this.handleModify(bank.id)}
                    onDelete={() => this.handleDelete(bank.id)}
                />
            ))}
        </Card>
    </div>
);
export default AddBankForm;
