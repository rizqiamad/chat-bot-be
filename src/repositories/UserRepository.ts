import { db } from '../config/db';
import GenericRepository from './GenericRepository';
import type { Prisma } from '@prisma/client';

export default class UserRepository extends GenericRepository<
	typeof db.user,
	Prisma.UserWhereInput,
	Prisma.UserCreateInput,
	Prisma.UserUpdateInput
> {
	constructor() {
		super(db.user);
	}
}
