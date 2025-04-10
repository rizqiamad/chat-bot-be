import { db } from '../config/db';
import GenericRepository from './GenericRepository';
import type { Prisma } from '@prisma/client';

export default class AccountRepository extends GenericRepository<
	typeof db.account,
	Prisma.AccountWhereInput,
	Prisma.AccountCreateInput,
	Prisma.AccountUpdateInput
> {
	constructor() {
		super(db.account);
	}
}
