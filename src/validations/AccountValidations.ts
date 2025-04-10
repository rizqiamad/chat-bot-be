import { Role } from '@prisma/client';
import { z } from 'zod';
import AccountService from '../services/AccountService';

const accountService = new AccountService();

const phoneRegex = new RegExp(
	/^(?:\+62|0)?[-. ]?\(?([0-9]{2,4})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4,6})$/
);

export const baseAccountSchema = z.object({
	name: z.string().min(1, { message: 'Must contain at least 1 character' }),
	username: z.string().min(6, { message: 'Must contain at least 6 character' }),
	phone: z.string().regex(phoneRegex, 'Must be a valid phone number'),
	email: z.string().email({ message: 'Must be a valid email address' }),
	password: z
		.string()
		.min(6, { message: 'Must be at least 6 characters long' }),
	role: z.enum([Role.ADMIN, Role.USER]).optional(),
	refreshToken: z.string().optional(),
});

// CREATE schema (full validation)
export const createAccountSchema = baseAccountSchema.superRefine(
	async (data, ctx) => {
		const existingEmail = await accountService.getByKey('email', data.email);
		if (existingEmail) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Email already registered',
				path: ['email'],
			});
		}
		const existingPhone = await accountService.getByKey('phone', data.phone);
		if (existingPhone) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Phone already registered',
				path: ['phone'],
			});
		}
		const existingUsername = await accountService.getByKey(
			'username',
			data.phone
		);
		if (existingUsername) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'username already registered',
				path: ['username'],
			});
		}
	}
);

export type CreateAccountInput = z.infer<typeof baseAccountSchema>;

export const updateAccountSchema = baseAccountSchema.partial();

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const registerAccountSchema = baseAccountSchema.omit({
	role: true,
	refreshToken: true,
});

export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

export const loginAccountSchema = registerAccountSchema
	.omit({ name: true })
	.extend({
		phone: z
			.string()
			.regex(phoneRegex, 'Must be a valid phone number')
			.optional(),
		email: z
			.string()
			.email({ message: 'Must be a valid email address' })
			.optional(),
	});

export type LoginAccountInput = z.infer<typeof loginAccountSchema>;
