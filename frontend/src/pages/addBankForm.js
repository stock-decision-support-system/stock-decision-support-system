import React, { useState, useEffect } from 'react';
import BankDialog from '../components/bankDialog.js';
import { Card } from 'antd';
import BankItem from '../components/bankItem.js';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';

const AddBankForm = () => {
    const [banks, setBanks] = useState([]);

    useEffect(() => {
        convertStatus();
    }, []);

    const convertStatus = () => {
        BankProfileRequest.getBankProfileList()
            .then(response => {
                setBanks(response.data);
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    const handleModify = (id) => {
        // Handle modify logic
    };

    const handleDelete = (id) => {
        // Handle delete logic
    };

    return (
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
                        region={bank.region}
                        branch={bank.branch}
                        account={bank.account}
                        onModify={() => handleModify(bank.id)}
                        onDelete={() => handleDelete(bank.id)}
                    />
                ))}
            </Card>
        </div>
    );
};

export default AddBankForm;
