import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

export async function connectDB() {
	try {
		await db.$connect();
		console.log("[database]: connected");
	} catch (error) {
		console.log("[database]: connection error: ", error);
		await db.$disconnect();
	}
}
