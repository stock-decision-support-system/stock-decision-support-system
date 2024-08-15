import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/stock";
const GET_URL = "/get";

export class StockRequest {
    static getStock(id) {
        return FetchUtil.getAPI(`${BASE_URL}${GET_URL}/${id}`);
    }

    static async getAPI(url, data) {
        const requestOptions = {
          method: GET,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        };
        return await this.getPromise(url, requestOptions, data);
      }
}
