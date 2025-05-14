import { Role } from '@prisma/client';
import { z } from 'zod';
import AccountService from '../services/AccountService';

const accountService = new AccountService();

const phoneRegex = new RegExp(
	/^(?:\+62|0)?[-. ]?\(?([0-9]{2,4})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4,6})$/
);

const baseAccountSchema = z.object({
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

/**
 * Reusable superRefine function to validate unique constraints
 */
const validateUniqueFields = async (
	data: z.infer<typeof baseAccountSchema>,
	ctx: z.RefinementCtx
) => {
	const [existingEmail, existingPhone, existingUsername] = await Promise.all([
		accountService.getByKey('email', data.email),
		accountService.getByKey('phone', data.phone),
		accountService.getByKey('username', data.username),
	]);

	if (existingEmail) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Email already registered',
			path: ['email'],
		});
	}
	if (existingPhone) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Phone already registered',
			path: ['phone'],
		});
	}
	if (existingUsername) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Username already registered',
			path: ['username'],
		});
	}
};

// CREATE schema (full validation)
export const createAccountSchema =
	baseAccountSchema.superRefine(validateUniqueFields);
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// UPDATE schema (partial input + validation)
export const updateAccountSchema = baseAccountSchema
	.partial()
	.superRefine(async (data, ctx) => {
		if (data.email || data.phone || data.username) {
			// Hanya validasi field yang diberikan
			const checks = await Promise.all([
				data.email ? accountService.getByKey('email', data.email) : null,
				data.phone ? accountService.getByKey('phone', data.phone) : null,
				data.username
					? accountService.getByKey('username', data.username)
					: null,
			]);

			if (checks[0]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Email already registered',
					path: ['email'],
				});
			}
			if (checks[1]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Phone already registered',
					path: ['phone'],
				});
			}
			if (checks[2]) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Username already registered',
					path: ['username'],
				});
			}
		}
	});
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// REGISTER schema (create user, no admin role)
export const registerAccountSchema = baseAccountSchema
	.omit({ role: true, refreshToken: true })
	.superRefine(validateUniqueFields);
export type RegisterAccountInput = z.infer<typeof registerAccountSchema>;

// LOGIN schema (flexible login)
export const loginAccountSchema = baseAccountSchema
	.omit({
		name: true,
		role: true,
		refreshToken: true,
	})
	.partial()
	.extend({
		password: z
			.string()
			.min(6, { message: 'Must be at least 6 characters long' }), // override jadi wajib
	});
export type LoginAccountInput = z.infer<typeof loginAccountSchema>;
