import { CustomError } from './custom-error';

export class DatabaseConnectonError extends CustomError {
  reason = 'Database connection error';
  statusCode = 500;
  constructor() {
    super('database error');
    Object.setPrototypeOf(this, DatabaseConnectonError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
