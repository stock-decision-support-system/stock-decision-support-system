import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/bank-profile";
const LIST_URL = "/list";
const GET_URL = "/get";
const PUT_URL = "/update";
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

    static updateBankProfile(data) {
        return FetchUtil.putAPI(`${BASE_URL}${PUT_URL}/${data.id}`, data);
    }

    static deleteBankProfile(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}${DEL_URL}/${id}`);
    }
}
