export default class GenericRepository<
	TDelegate,
	TWhereInput,
	TCreateInput,
	TUpdateInput
> {
	protected readonly model: TDelegate;

	constructor(model: TDelegate) {
		this.model = model;
	}

	async getAll(select?: object) {
		// handle error generic repository
		// @ts-expect-error
		return await this.model.findMany({
			select: select || undefined,
		});
	}

	async getById(id: string) {
		// @ts-expect-error
		return await this.model.findUnique({ where: { id } });
	}

	async getByKey(
		key: keyof TWhereInput,
		value: TWhereInput[keyof TWhereInput]
	) {
		// @ts-expect-error
		return await this.model.findFirst({ where: { [key]: value } });
	}

	async create(data: TCreateInput) {
		// @ts-expect-error
		return await this.model.create({ data });
	}

	async update(id: string, data: TUpdateInput) {
		// @ts-expect-error
		return await this.model.update({ where: { id }, data });
	}

	async delete(id: string) {
		// @ts-expect-error
		return await this.model.delete({ where: { id } });
	}
}
