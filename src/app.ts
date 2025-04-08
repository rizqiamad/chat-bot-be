import cookieParser from 'cookie-parser';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { connectDB } from './config/db';
import { env } from 'node:process';
import ErrorHandler from './middlewares/ErrorHandler';
import { HttpException } from './utils/HttpExceptions';
import { AppRoutes } from './routes/AppRoutes';

const app = express();
const PORT = env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', AppRoutes);

// Handling routes not found
app.use((_req: Request, res: Response, next: NextFunction) => {
	next(new HttpException(404, 'Route not found'));
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	ErrorHandler(err, req, res, next);
});

// Inializing the server
const initializeApp = async () => {
	try {
		app.listen(PORT, () => {
			console.log(
				`[server]: server is running at http://localhost:${PORT}/api`
			);
		});
		await connectDB();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

initializeApp();
