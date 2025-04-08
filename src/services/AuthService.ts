import bcrypt from 'bcrypt';
import UserService from './UserService';
import { JwtHandling, type AuthTokens } from '../utils/JwtHandling';
import type {
	LoginUserInput,
	RegisterUserInput,
} from '../validations/UserValidations';
import { HttpException } from '../utils/HttpExceptions';
import dotenv from 'dotenv';

dotenv.config();

const userService = new UserService();
const jwthandling = new JwtHandling();

export default class AuthService {
	private readonly userService: UserService;
	private readonly jwthandling: JwtHandling;
	constructor() {
		this.userService = userService;
		this.jwthandling = jwthandling;
	}
	async login(data: LoginUserInput): Promise<AuthTokens> {
		let user;
		if (data.phone) user = await this.userService.getByKey('phone', data.phone);
		else user = await this.userService.getByKey('email', data.email);
		if (!user || !(await bcrypt.compare(data.password, user.password)))
			throw new HttpException(400, 'Wrong credentials');
		const { accessToken, refreshToken } = this.jwthandling.genAuthTokens({
			id: user.id,
			email: user.email,
			role: user.role,
		});
		await this.userService.updateRefreshToken(user.id, refreshToken);
		return { accessToken, refreshToken };
	}
	async register(data: RegisterUserInput): Promise<AuthTokens> {
		const newUser = await this.userService.create(data);
		const { accessToken, refreshToken } = this.jwthandling.genAuthTokens({
			id: newUser.id,
			email: newUser.email,
			role: newUser.role,
		});
		await this.userService.updateRefreshToken(newUser.id, refreshToken);
		return { accessToken, refreshToken };
	}
	async refresh(refreshToken: string): Promise<{ accessToken: string }> {
		const user = await this.userService.getByKey('refreshToken', refreshToken);
		if (!user) throw new HttpException(403, 'Forbidden');
		const decoded = await this.jwthandling.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET as string
		);
		const isroleMatch = decoded.role.includes(user.role);
		if (decoded.email !== user.email || !isroleMatch)
			throw new HttpException(403, 'Forbidden');
		const { accessToken } = this.jwthandling.genAuthTokens({
			id: user.id,
			email: user.email,
			role: user.role,
		});
		return { accessToken };
	}
	async logout(refreshToken: string) {
		const user = await this.userService.getByKey('refreshToken', refreshToken);
		if (user) return await this.userService.updateRefreshToken(user.id, '');
	}
}
