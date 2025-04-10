import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import ValidateRequest from '../middlewares/ValidateRequest';
import {
	loginAccountSchema,
	registerAccountSchema,
} from '../validations/AccountValidations';

const router = Router();
const authController = new AuthController();

router
	.post(
		'/login',
		ValidateRequest(loginAccountSchema),
		authController.login.bind(authController)
	)
	.post(
		'/register',
		ValidateRequest(registerAccountSchema),
		authController.register.bind(authController)
	)
	.post('/refresh', authController.refresh.bind(authController))
	.post('/logout', authController.logout.bind(authController));

export { router as AuthRoutes };
