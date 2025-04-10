import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import AccountRepository from '../repositories/AccountRepository';
import { HttpException } from '../utils/HttpExceptions';
import type {
	CreateAccountInput,
	UpdateAccountInput,
} from '../validations/AccountValidations';

const accountRepository = new AccountRepository();

export default class AccountService {
	private accountRepository: AccountRepository;
	constructor() {
		this.accountRepository = accountRepository;
	}

	async getAll() {
		return await this.accountRepository.getAll({
			id: true,
			email: true,
			role: true,
			// password tidak di-include
		});
	}

	async getById(id: string) {
		const account = await this.accountRepository.getById(id);
		if (!account) throw new HttpException(404, 'Account not found');
		return account;
	}

	async getByKey(
		key: keyof Prisma.AccountWhereInput,
		value: Prisma.AccountWhereInput[typeof key]
	) {
		return await this.accountRepository.getByKey(key, value);
	}

	async create(data: CreateAccountInput) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		return await this.accountRepository.create({
			...data,
			password: hashedPassword,
		});
	}

	async update(
		id: string,
		data: UpdateAccountInput,
		currentAccount: { id: string; role: Role }
	) {
		await this.getById(id);
		if (currentAccount.id !== id && currentAccount.role !== Role.ADMIN)
			throw new HttpException(403, 'Forbidden');
		if (currentAccount.role !== Role.ADMIN && data.role) delete data.role;
		if (data.password) data.password = await bcrypt.hash(data.password, 10);
		return await this.accountRepository.update(id, data);
	}

	async delete(id: string) {
		await this.getById(id);
		await this.accountRepository.delete(id);
	}

	async updateRefreshToken(id: string, refreshToken: string) {
		return await this.accountRepository.update(id, { refreshToken });
	}
}
