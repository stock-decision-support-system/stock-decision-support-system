import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/stock";
const GET_URL = "/get";
const TW_URL = "/twfif";
export class StockRequest {
  static getStock(id) {
    return FetchUtil.getNoTokenAPI(`${BASE_URL}${GET_URL}/${id}`);
  }
  static getTwFif(id) {
    return FetchUtil.getNoTokenAPI(`${BASE_URL}${TW_URL}`);
  }
}
