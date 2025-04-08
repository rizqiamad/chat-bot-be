import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/UserRepository';
import { HttpException } from '../utils/HttpExceptions';
import type {
	CreateUserInput,
	UpdateUserInput,
} from '../validations/UserValidations';

const userRepository = new UserRepository();

export default class UserService {
	private userRepository: UserRepository;
	constructor() {
		this.userRepository = userRepository;
	}

	async getAll() {
		return await this.userRepository.getAll({
			id: true,
			email: true,
			role: true,
			// password tidak di-include
		});
	}

	async getById(id: string) {
		const user = await this.userRepository.getById(id);
		if (!user) throw new HttpException(404, 'User not found');
		return user;
	}

	async getByKey(
		key: keyof Prisma.UserWhereInput,
		value: Prisma.UserWhereInput[typeof key]
	) {
		return await this.userRepository.getByKey(key, value);
	}

	async create(data: CreateUserInput) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		return await this.userRepository.create({
			...data,
			password: hashedPassword,
		});
	}

	async update(
		id: string,
		data: UpdateUserInput,
		currentUser: { id: string; role: Role }
	) {
		await this.getById(id);
		if (currentUser.id !== id && currentUser.role !== Role.ADMIN)
			throw new HttpException(403, 'Forbidden');
		if (currentUser.role !== Role.ADMIN && data.role) delete data.role;
		if (data.password) data.password = await bcrypt.hash(data.password, 10);
		return await this.userRepository.update(id, data);
	}

	async delete(id: string) {
		await this.getById(id);
		await this.userRepository.delete(id);
	}

	async updateRefreshToken(id: string, refreshToken: string) {
		return await this.userRepository.update(id, { refreshToken });
	}
}
