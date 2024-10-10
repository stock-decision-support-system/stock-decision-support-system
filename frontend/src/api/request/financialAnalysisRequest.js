import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/financial-analysis";

export class FinancialAnalysisRequest {
  static getAccountingAI() {
    return FetchUtil.getAPI(`${BASE_URL}`);
  }
}
