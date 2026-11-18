export type ErrorDetail = { field: string; message: string };

export class AppError extends Error {
	constructor(
		public readonly statusCode: number,
		public readonly code: string,
		message: string,
		public readonly details?: ErrorDetail[],
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class BadRequestError extends AppError {
	constructor(code: string, message: string, details?: ErrorDetail[]) {
		super(400, code, message, details);
	}
}

export class UnauthorizadeError extends AppError {
	constructor(code: string, message: string) {
		super(401, code, message);
	}
}

export class ForbiddenError extends AppError {
	constructor(code: string, message: string) {
		super(403, code, message);
	}
}

export class NotFoundError extends AppError {
	constructor(code: string, message: string) {
		super(404, code, message);
	}
}

export class ConfictError extends AppError {
	constructor(code: string, message: string) {
		super(409, code, message);
	}
}
