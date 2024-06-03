import React, { useState, useEffect } from 'react';
import { Card, Button, Empty } from 'antd';
import BankDialog from '../components/bankDialog';
import BankItem from '../components/bankItem';
import { BankProfileRequest } from '../api/request/bankProfileRequest.js';

const AddBankForm = () => {
    const [banks, setBanks] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);

    useEffect(() => {
        fetchBankProfiles();
    }, []);

    const fetchBankProfiles = () => {
        BankProfileRequest.getBankProfileList()
            .then(response => {
                setBanks(response.data);
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    const handleAddClick = () => {
        setIsEdit(false);
        setIsDialogVisible(true);
    };

    const handleModifyClick = (id) => {
        setIsEdit(true);
        BankProfileRequest.getBankProfile(id)
            .then(response => {
                setInitialData(response.data);
            })
            .catch((error) => {
                alert(error.message);
            });
        setIsDialogVisible(true);
    };

    const handleDelete = (id) => {
        BankProfileRequest.deleteBankProfile(id)
            .then(response => {
                alert(response.message);
                fetchBankProfiles();
            })
            .catch((error) => {
                alert(error.message);
            });
    };

    const handleDialogClose = () => {
        setIsDialogVisible(false);
        fetchBankProfiles();
    };

    return (
        <div className="position-absolute top-50 start-50 translate-middle kv w-75 h-50">
            <Card
                title={<h1 className='pt-2'>銀行資料</h1>}
                extra={<Button type="primary" onClick={handleAddClick}>新增銀行資料</Button>}
                className='h-100'
            >
                {(!banks || banks.length === 0) ? (
                    <Empty description="沒有銀行資料" />
                ) : (banks.map(bank => (
                    <BankItem
                        key={bank.id}
                        bankName={bank.bank_name}
                        region={bank.region}
                        branch={bank.branch}
                        account={bank.account}
                        onModify={() => handleModifyClick(bank.id)}
                        onDelete={() => handleDelete(bank.id)}
                    />
                ))
                )}
            </Card>
            {isDialogVisible && (
                <BankDialog
                    isEdit={isEdit}
                    initialData={initialData}
                    onClose={handleDialogClose}
                />
            )}
        </div>
    );
};

export default AddBankForm;
