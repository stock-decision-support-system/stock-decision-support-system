import { FetchUtil } from "../util/fetchUtil";

const BASE_URL = "/investment";
const STOCK_URL = "/stocks";
const PORTFOLIOS_URL = "/portfolios";
const CREATE_URL = "/create";
const INVESTMENTS_URL = "/investments";
const DELETE_URL = "/delete";
const STOCK_PRICE_URL = "/stock_price";

export class InvestmentRequest {
    static getAllStocks() {
        return FetchUtil.getAPI(`${BASE_URL}${STOCK_URL}`);
    }

    static getPortfolios() {
        return FetchUtil.getAPI(`${BASE_URL}${PORTFOLIOS_URL}`);
    }

    static createPortfolio(data) {
        return FetchUtil.postAPI(`${BASE_URL}${PORTFOLIOS_URL}${CREATE_URL}`, data);
    }

    static addInvestment(id, data) {
        return FetchUtil.postAPI(`${BASE_URL}${PORTFOLIOS_URL}/${id}${INVESTMENTS_URL}`, data);
    }

    static deletePortfolio(id) {
        return FetchUtil.deleteAPI(`${BASE_URL}${PORTFOLIOS_URL}/${id}${DELETE_URL}`);
    }

    static getStockPrice(symbol) {
        return FetchUtil.getAPI(`${BASE_URL}${STOCK_PRICE_URL}/${symbol}`);
    }

    static getPortfolioDetail(id) {
        return FetchUtil.getAPI(`${BASE_URL}${PORTFOLIOS_URL}/${id}`);
    }

    static updatePortfolio(id, data) {
        return FetchUtil.putAPI(`${BASE_URL}${PORTFOLIOS_URL}/${id}/update`, data);
    }
}
