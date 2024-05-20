import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/bank-profile";
const LIST_URL = "/list";
const GET_URL = "/get";
const PATCH_URL = "/patch";
const DEL_URL = "/delete";
const ADD_URL = "/add";

export class BankProfileRequest {
    static getBankProfileList() {
        return FetchUtil.getAPI(`${BASE_URL}${LIST_URL}`);
    }

    static getBankProfile(id) {
        return FetchUtil.getAPI(`${BASE_URL}${GET_URL}/${id}`);
    }

    static addBankProfile(data) {
        return FetchUtil.postAPI(`${BASE_URL}${ADD_URL}`, data);
    }

    static updateBankProfile(id, data) {
        return FetchUtil.putAPI(`${BASE_URL}${PATCH_URL}/${id}`, data);
    }

    static deleteBankProfile(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}${DEL_URL}/${id}`);
    }
}
