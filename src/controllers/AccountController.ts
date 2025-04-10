import type { NextFunction, Request, Response } from 'express';
import AccountService from '../services/AccountService';
import { AuthRequest } from '../middlewares/Auth';

const accountService = new AccountService();
export default class AccountController {
	private readonly accountService: AccountService;
	constructor() {
		this.accountService = accountService;
	}
	async getAll(_req: Request, res: Response, next: NextFunction) {
		try {
			const accounts = await this.accountService.getAll();
			res.status(200).json({ accounts });
		} catch (err) {
			next(err);
		}
	}
	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const account = await this.accountService.getById(req.params.id);
			res.status(200).json({ account });
		} catch (err) {
			next(err);
		}
	}
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const account = await this.accountService.create(req.body);
			res.status(201).json({ account });
		} catch (err) {
			next(err);
		}
	}
	async update(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const currentAccount = req.account!;
			const account = await this.accountService.update(
				req.params.id,
				req.body,
				currentAccount
			);
			res.status(200).json({ account });
		} catch (err) {
			next(err);
		}
	}
	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			await this.accountService.delete(req.params.id);
			res.sendStatus(204);
		} catch (err) {
			next(err);
		}
	}
}
