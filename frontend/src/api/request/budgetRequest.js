import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/budget";

export class BudgetRequest {
    static searchBudget() {
        return FetchUtil.getAPI(`${BASE_URL}`);
    }
    static getBudget(id) {
        return FetchUtil.getAPI(`${BASE_URL}/${id}`);
    }
    static addBudget(data) {
        return FetchUtil.postAPI(`${BASE_URL}`, data);
    }
    static updateBudget(id, data) {
        return FetchUtil.putAPI(`${BASE_URL}/${id}`, data);
    }
    static deleteBudget(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}/${id}`);
    }
}
