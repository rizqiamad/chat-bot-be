import { Router } from 'express';
import { UserRoutes } from './UserRoutes';
import Auth from '../middlewares/Auth';
import { Role } from '@prisma/client';
import { AuthRoutes } from './AuthRoutes';

const router = Router();
const authMiddleware = new Auth();
router.use(
	'/users',
	authMiddleware.verifyToken,
	authMiddleware.verifyRoles([Role.ADMIN, Role.USER]),
	UserRoutes
);
router.use('/auth', AuthRoutes);
export { router as AppRoutes };
