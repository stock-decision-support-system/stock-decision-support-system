import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/accounting";
const USER_URL = "/user"
const FINANCIAL_URL = "/financial-summary";
const USERS_URL = "/users"

export class AccountingRequest {
    static getAccountingList() {
        return FetchUtil.getAPI(`${BASE_URL}${USER_URL}`);
    }

    static addAccountingData(data) {
        return FetchUtil.postAPI(`${BASE_URL}${USER_URL}`, data);
    }

    static getFinancialSummary() {
        const username = localStorage.getItem('username')
        return FetchUtil.getAPI(`${USERS_URL}/${username}${FINANCIAL_URL}`);
    }
}
