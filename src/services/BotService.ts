import { Prisma } from '@prisma/client';
import BotRepository from '../repositories/BotRepository';
import { HttpException } from '../utils/HttpExceptions';
import type {
	CreateBotInput,
	UpdateBotInput,
} from '../validations/BotValidations';

const botRepository = new BotRepository();

export default class BotService {
	private botRepository: BotRepository;
	constructor() {
		this.botRepository = botRepository;
	}

	async getAll(id: string) {
		const bot = await this.botRepository.getByKey('accountId', id, {
			select: {
				id: true,
				name: true,
				platform: true,
				active: true,
				token: true,
				phone: true,
				createdAt: true,
				updatedAt: true,
			},
			many: true,
		});
		return bot;
	}

	async getById(id: string) {
		const bot = await this.botRepository.getById(id);
		if (!bot) throw new HttpException(404, 'Bot not found');
		return bot;
	}

	async getByKey(
		key: keyof Prisma.BotsWhereInput,
		value: Prisma.BotsWhereInput[typeof key],
		options?: { select?: any; many?: boolean }
	) {
		return await this.botRepository.getByKey(key, value, options);
	}

	async create(id: string, data: CreateBotInput) {
		return await this.botRepository.create({
			name: data.name,
			platform: data.platform,
			active: data.active ?? true,
			token: data.token,
			phone: data.phone,
			account: {
				connect: { id: id },
			},
		});
	}

	async update(id: string, data: UpdateBotInput) {
		await this.getById(id);
		return await this.botRepository.update(id, data);
	}

	async delete(id: string) {
		await this.getById(id);
		await this.botRepository.delete(id);
	}
}
