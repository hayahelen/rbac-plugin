// src/rbac/types/rbac.types.ts

export type RbacUser = {
  id: string;
  clerkUserId?: string;
};

export type RbacMembership = {
  organizationId: string;
  role: {
    id: string;
    name: string;
    rolePermissions: {
      permission: {
        key: string;
      };
    }[];
  };
};
