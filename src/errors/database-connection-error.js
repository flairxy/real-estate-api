"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnectonError = void 0;
const custom_error_1 = require("./custom-error");
class DatabaseConnectonError extends custom_error_1.CustomError {
    constructor() {
        super('database error');
        this.reason = 'Database connection error';
        this.statusCode = 500;
        Object.setPrototypeOf(this, DatabaseConnectonError.prototype);
    }
    serializeErrors() {
        return [{ message: this.reason }];
    }
}
exports.DatabaseConnectonError = DatabaseConnectonError;
