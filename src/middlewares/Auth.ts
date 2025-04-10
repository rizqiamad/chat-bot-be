import type { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/HttpExceptions';
import type { Role } from '@prisma/client';
import { JwtHandling } from '../utils/JwtHandling';

export interface AuthRequest extends Request {
	account?: {
		id: string;
		email: string;
		role: Role;
	};
}

const { ACCESS_TOKEN_SECRET } = process.env as { [key: string]: string };

export default class Auth {
	async verifyToken(
		req: AuthRequest,
		_res: Response,
		next: NextFunction
	): Promise<void> {
		try {
			const { authorization } = req.headers;
			if (!authorization) throw new HttpException(401, 'Unauthorized');
			const [type, token] = authorization.split(' ');
			if (type !== 'Bearer') throw new HttpException(401, 'Unauthorized');
			const decoded = await new JwtHandling().verify(
				token,
				ACCESS_TOKEN_SECRET
			);
			req.account = decoded as { id: string; email: string; role: Role };
			next();
		} catch (err) {
			next(err);
		}
	}
	verifyRoles(allowedRoles: Role[]) {
		return (req: AuthRequest, _res: Response, next: NextFunction): void => {
			if (!req.account || !req.account?.role)
				throw new HttpException(403, 'Forbidden');
			if (!allowedRoles.includes(req.account.role))
				throw new HttpException(403, 'Forbidden');
			next();
		};
	}
}
