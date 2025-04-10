import { db } from '../config/db';
import GenericRepository from './GenericRepository';
import type { Prisma } from '@prisma/client';

export default class BotRepository extends GenericRepository<
	typeof db.bots,
	Prisma.BotsWhereInput,
	Prisma.BotsCreateInput,
	Prisma.BotsUpdateInput
> {
	constructor() {
		super(db.bots);
	}
}
