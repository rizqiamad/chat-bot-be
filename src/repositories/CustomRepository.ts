import { db } from '../config/db';
import GenericRepository from './GenericRepository';
import type { Prisma } from '@prisma/client';

export default class CustomRepository extends GenericRepository<
	typeof db.customs,
	Prisma.CustomsWhereInput,
	Prisma.CustomsCreateInput,
	Prisma.CustomsUpdateInput
> {
	constructor() {
		super(db.customs);
	}
}
