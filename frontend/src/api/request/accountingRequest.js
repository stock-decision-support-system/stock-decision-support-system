import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/accounting";
const USER_URL = "/user"

export class AccountingRequest {
    static getAccountingList() {
        return FetchUtil.getAPI(`${BASE_URL}${USER_URL}`);
    }
}
