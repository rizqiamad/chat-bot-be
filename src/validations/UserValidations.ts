import { Role } from '@prisma/client';
import { z } from 'zod';
import UserService from '../services/UserService';

const userService = new UserService();

const phoneRegex = new RegExp(
	/^(?:\+62|0)?[-. ]?\(?([0-9]{2,4})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4,6})$/
);

export const baseUserSchema = z.object({
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
export const createUserSchema = baseUserSchema.superRefine(
	async (data, ctx) => {
		const existingEmail = await userService.getByKey('email', data.email);
		if (existingEmail) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Email already registered',
				path: ['email'],
			});
		}
		const existingPhone = await userService.getByKey('phone', data.phone);
		if (existingPhone) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Phone already registered',
				path: ['phone'],
			});
		}
		const existingUsername = await userService.getByKey('username', data.phone);
		if (existingUsername) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Username already registered',
				path: ['username'],
			});
		}
	}
);

export type CreateUserInput = z.infer<typeof baseUserSchema>;

export const updateUserSchema = baseUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const registerUserSchema = baseUserSchema.omit({
	role: true,
	refreshToken: true,
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const loginUserSchema = registerUserSchema.omit({ name: true }).extend({
	phone: z
		.string()
		.regex(phoneRegex, 'Must be a valid phone number')
		.optional(),
	email: z
		.string()
		.email({ message: 'Must be a valid email address' })
		.optional(),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
