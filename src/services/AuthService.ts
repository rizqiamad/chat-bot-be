import bcrypt from 'bcrypt';
import AccountService from './AccountService';
import { JwtHandling, type AuthTokens } from '../utils/JwtHandling';
import type {
	LoginAccountInput,
	RegisterAccountInput,
} from '../validations/AccountValidations';
import { HttpException } from '../utils/HttpExceptions';
import dotenv from 'dotenv';

dotenv.config();

const accountService = new AccountService();
const jwthandling = new JwtHandling();

export default class AuthService {
	private readonly accountService: AccountService;
	private readonly jwthandling: JwtHandling;
	constructor() {
		this.accountService = accountService;
		this.jwthandling = jwthandling;
	}
	async login(data: LoginAccountInput): Promise<AuthTokens> {
		let account;
		if (data.phone)
			account = await this.accountService.getByKey('phone', data.phone);
		else account = await this.accountService.getByKey('email', data.email);
		if (!account || !(await bcrypt.compare(data.password, account.password)))
			throw new HttpException(400, 'Wrong credentials');
		const { accessToken, refreshToken } = this.jwthandling.genAuthTokens({
			id: account.id,
			email: account.email,
			role: account.role,
		});
		await this.accountService.updateRefreshToken(account.id, refreshToken);
		return { accessToken, refreshToken };
	}
	async register(data: RegisterAccountInput): Promise<AuthTokens> {
		const newAccount = await this.accountService.create(data);
		const { accessToken, refreshToken } = this.jwthandling.genAuthTokens({
			id: newAccount.id,
			email: newAccount.email,
			role: newAccount.role,
		});
		await this.accountService.updateRefreshToken(newAccount.id, refreshToken);
		return { accessToken, refreshToken };
	}
	async refresh(refreshToken: string): Promise<{ accessToken: string }> {
		const account = await this.accountService.getByKey(
			'refreshToken',
			refreshToken
		);
		if (!account) throw new HttpException(403, 'Forbidden');
		const decoded = await this.jwthandling.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET as string
		);
		const isroleMatch = decoded.role.includes(account.role);
		if (decoded.email !== account.email || !isroleMatch)
			throw new HttpException(403, 'Forbidden');
		const { accessToken } = this.jwthandling.genAuthTokens({
			id: account.id,
			email: account.email,
			role: account.role,
		});
		return { accessToken };
	}
	async logout(refreshToken: string) {
		const account = await this.accountService.getByKey(
			'refreshToken',
			refreshToken
		);
		if (account)
			return await this.accountService.updateRefreshToken(account.id, '');
	}
}
