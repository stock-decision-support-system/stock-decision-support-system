import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/consume-type";
const CHART_URL = "/chart";

export class CategoryRequest {
    static searchConsumeType() {
        return FetchUtil.getAPI(`${BASE_URL}`);
    }
    static getConsumeType(id) {
        return FetchUtil.getAPI(`${BASE_URL}/${id}`);
    }
    static addConsumeType(data) {
        return FetchUtil.postAPI(`${BASE_URL}`, data);
    }
    static updateConsumeType(data) {
        return FetchUtil.putAPI(`${BASE_URL}`, data);
    }
    static deleteConsumeType(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}/${id}`);
    }
    static getConsumeTypeChart() {
        return FetchUtil.getAPI(`${BASE_URL}${CHART_URL}`);
    }
}
