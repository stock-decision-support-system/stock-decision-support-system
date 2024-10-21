import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/bank-profile";
const LIST_URL = "/list";
const GET_URL = "/get";
const PUT_URL = "/update";
const DEL_URL = "/delete";
const ADD_URL = "/add";
const CHECK_URL = "/check";
const UPLOAD_URL = "/upload";

export class BankProfileRequest {
    static getBankProfileList() {
        return FetchUtil.getAPI(`${BASE_URL}${LIST_URL}`);
    }

    static getBankProfile(id) {
        return FetchUtil.getAPI(`${BASE_URL}${GET_URL}/${id}`);
    }

    static addBankProfile(data) {
        return FetchUtil.postFileFormDataAPI(`${BASE_URL}${ADD_URL}`, data);
    }

    static updateBankProfile(data) {
        return FetchUtil.putFileFormDataAPI(`${BASE_URL}${PUT_URL}/${data.get('id')}`, data);
    }

    static deleteBankProfile(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}${DEL_URL}/${id}`);
    }

    static checkUploadStatus() {
        return FetchUtil.getAPI(`${BASE_URL}${CHECK_URL}`);
    }
    
    static uploadPDF(data){
        return FetchUtil.postFileFormDataAPI(`${BASE_URL}${UPLOAD_URL}`, data);
    }
}
