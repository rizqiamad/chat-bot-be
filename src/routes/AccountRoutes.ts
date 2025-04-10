import { Router } from 'express';
import AccountController from '../controllers/AccountController';
import ValidateRequest from '../middlewares/ValidateRequest';
import {
	createAccountSchema,
	updateAccountSchema,
} from '../validations/AccountValidations';
import Auth from '../middlewares/Auth';
import { Role } from '@prisma/client';

const accountController = new AccountController();
const authMiddleware = new Auth();
const router = Router();

router
	.get('/', accountController.getAll.bind(accountController))
	.get('/:id', accountController.getById.bind(accountController))
	.post(
		'/',
		ValidateRequest(createAccountSchema),
		accountController.create.bind(accountController)
	)
	.patch(
		'/:id',
		ValidateRequest(updateAccountSchema),
		accountController.update.bind(accountController)
	)
	.delete(
		'/:id',
		authMiddleware.verifyRoles([Role.ADMIN]),
		accountController.delete.bind(accountController)
	);

export { router as AccountRoutes };
