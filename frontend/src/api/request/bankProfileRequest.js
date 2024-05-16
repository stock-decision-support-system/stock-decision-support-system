import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/bank-profile";
const LIST_URL = "/list";

export class BankProfileRequest {
    static getBankProfileList() {
        return FetchUtil.getAPI(`${BASE_URL}${LIST_URL}`);
    }

    static getBankProfile(id) {
        return FetchUtil.getAPI(`${BASE_URL}${LIST_URL}/${id}`);
    }

    static addBankProfile(data) {
        return FetchUtil.postAPI(`${BASE_URL}`, data);
    }

    static updateBankProfile(id, data) {
        return FetchUtil.putAPI(`${BASE_URL}/${id}`, data);
    }

    static deleteBankProfile(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}/${id}`);
    }
}
