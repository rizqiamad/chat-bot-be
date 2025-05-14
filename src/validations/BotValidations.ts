import { z } from 'zod';
import BotService from '../services/BotService';

const botService = new BotService();

const phoneRegex = new RegExp(
	/^(?:\+62|0)?[-. ]?\(?([0-9]{2,4})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4,6})$/
);

const baseBotSchema = z.object({
	accountId: z.string().min(1, { message: 'Account ID is required' }),
	name: z.string().min(1, { message: 'Name is required' }),
	platform: z.enum(['telegram', 'whatsapp'], {
		message: 'Platform must be either telegram or whatsapp',
	}),
	active: z.boolean().optional(),
	token: z.string().min(1, { message: 'Token is required' }),
	phone: z.string().regex(phoneRegex, 'Must be a valid phone number'),
});

// Fungsi reusable untuk validasi unik
async function validateUniqueFields(
	data: any,
	ctx: z.RefinementCtx,
	idToExclude?: string
) {
	const checkAndAddIssue = async (
		key: 'name' | 'phone' | 'token',
		message: string
	) => {
		const existing = await botService.getByKey(key, data[key]);
		if (existing && existing.id !== idToExclude) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message,
				path: [key],
			});
		}
	};

	await Promise.all([
		checkAndAddIssue('name', 'Bot name already registered'),
		checkAndAddIssue('phone', 'Phone already registered'),
		checkAndAddIssue('token', 'Token already in use'),
	]);
}

// CREATE schema
export const createBotSchema = baseBotSchema.superRefine(async (data, ctx) => {
	await validateUniqueFields(data, ctx);
});

export type CreateBotInput = z.infer<typeof baseBotSchema>;

// UPDATE schema (partial + id untuk pengecualian diri sendiri)
const updateBotSchemaBase = baseBotSchema.partial().extend({
	id: z.string().min(1, { message: 'ID is required for update' }),
});

export const updateBotSchema = updateBotSchemaBase.superRefine(
	async (data, ctx) => {
		await validateUniqueFields(data, ctx, data.id);
	}
);

export type UpdateBotInput = z.infer<typeof updateBotSchema>;
