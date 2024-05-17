export class ValueCheckerUtil {
    static isUndefinedOrNull(value, includeString = true) {
        return !this.isNotUndefinedAndNull(value, includeString);
    }

    static isNotUndefinedAndNull(value, includeString = true) {
        if (includeString && typeof value === "string") {
            return value.toLowerCase() !== "undefined" && value.toLowerCase() !== "null";
        } else {
            return this.isNotUndefined(value) && this.isNotNull(value);
        }
    }

    static isUndefined(value) {
        return !this.isNotUndefined(value);
    }

    static isNotUndefined(value) {
        return typeof value !== "undefined";
    }

    static isNull(value) {
        return !this.isNotNull(value);
    }

    static isNotNull(value) {
        return value != null;
    }

    static isNotEmpty(value) {
        return !this.isEmpty(value);
    }

    static isEmpty(value) {
        return this.isUndefinedOrNull(value) || (typeof value === "string" && value.length === 0);
    }
}
