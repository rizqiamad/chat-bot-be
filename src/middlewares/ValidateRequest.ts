import type { Request, Response, NextFunction } from 'express';
import { type z, ZodError } from 'zod';
import { HttpValidationExceptions } from '../utils/HttpExceptions';

const ValidateRequest = (validationSchema: z.Schema) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			await validationSchema.parseAsync(req.body);
			next();
		} catch (err) {
			if (err instanceof ZodError) {
				const errorMessages = err.errors.map((error) => ({
					[error.path.join('.')]: error.message,
				}));
				next(new HttpValidationExceptions(errorMessages));
			}
		}
	};
};
export default ValidateRequest;
