import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/Auth';
import BotService from '../services/BotService';

const botService = new BotService();

export default class BotController {
	private readonly botService: BotService;
	constructor() {
		this.botService = botService;
	}

	async getAll(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const accountId = req.account!.id;
			const bots = await this.botService.getAll(accountId);
			res.status(200).json({ bots });
		} catch (err) {
			next(err);
		}
	}

	async getById(req: Request, res: Response, next: NextFunction) {
		try {
			const bot = await this.botService.getById(req.params.id);
			res.status(200).json({ bot });
		} catch (err) {
			next(err);
		}
	}

	async create(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const accountId = req.account!.id;
			const bot = await this.botService.create(accountId, req.body);
			res.status(201).json({ bot });
		} catch (err) {
			next(err);
		}
	}

	async update(req: AuthRequest, res: Response, next: NextFunction) {
		try {
			const bot = await this.botService.update(req.params.id, req.body);
			res.status(200).json({ bot });
		} catch (err) {
			next(err);
		}
	}

	async delete(req: Request, res: Response, next: NextFunction) {
		try {
			await this.botService.delete(req.params.id);
			res.sendStatus(204);
		} catch (err) {
			next(err);
		}
	}
}
