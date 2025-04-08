// tidak terpakai, hanya contoh

import { Role } from '@prisma/client';

type Permissions = {
	[key: string]: {
		[key: string]: string;
	};
};

export const permissions: Permissions = {
	basic: {
		read: 'read',
		create: 'create',
		update: 'update',
		delete: 'delete',
	},
};

const userPermissions = [permissions.basic.read];

const managerPermissions = [
	userPermissions[0],
	permissions.basic.create,
	permissions.basic.update,
];

const adminPermissions = [...managerPermissions, permissions.basic.delete];

const permissionsByRole = {
	[Role.USER]: userPermissions,
	[Role.ADMIN]: adminPermissions,
	[Role.MANAGER]: adminPermissions,
};

export const getPermissionsByRoles = (role: Role) => {
	const rolePermissions = permissionsByRole[role];
	if (!rolePermissions || rolePermissions.length === 0) return null;
	return rolePermissions;
};
