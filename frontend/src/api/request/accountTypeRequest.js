import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/account-type";

export class AccountTypeRequest {
    static searchAccountType() {
        return FetchUtil.getAPI(`${BASE_URL}`);
    }
    static getAccountType(id) {
        return FetchUtil.getAPI(`${BASE_URL}/${id}`);
    }
    static addAccountType(data) {
        return FetchUtil.postAPI(`${BASE_URL}`, data);
    }
    static updateAccountType(data) {
        return FetchUtil.putAPI(`${BASE_URL}`, data);
    }
    static deleteAccountType(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}/${id}`);
    }
}
