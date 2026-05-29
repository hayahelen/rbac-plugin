/*
  Warnings:

  - The existing `Permission` and `Role` tables will be preserved as `Permission_old` and `Role_old`.
  - Data will be copied into the new `permissions` and `roles` tables, preserving existing IDs.
  - Existing `memberships.roleId` and `role_permissions` rows continue to point to preserved IDs.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_roleId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- Rename old tables instead of dropping them to preserve existing rows and IDs.
ALTER TABLE "Permission" RENAME TO "Permission_old";
ALTER TABLE "Role" RENAME TO "Role_old";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- Copy existing Role rows into the new `roles` table, preserving IDs.
INSERT INTO "roles" ("id", "name", "description", "organizationId", "isActive", "createdAt", "updatedAt", "deletedAt")
SELECT "id", "name", "description", "organizationId", true, "createdAt", "updatedAt", "deletedAt"
FROM "Role_old";

-- Copy existing Permission rows into the new `permissions` table, deriving resource/action from the old key.
INSERT INTO "permissions" ("id", "organizationId", "resource", "action", "key", "description", "isActive", "createdAt", "updatedAt", "deletedAt")
SELECT "id",
       "organizationId",
       CASE
         WHEN position('.' IN "key") > 0 THEN split_part("key", '.', 1)
         ELSE coalesce("key", 'unknown')
       END,
       CASE
         WHEN position('.' IN "key") > 0 THEN split_part("key", '.', 2)
         ELSE ''
       END,
       "key",
       "description",
       true,
       "createdAt",
       "updatedAt",
       "deletedAt"
FROM "Permission_old";

-- Existing memberships.roleId and role_permissions.* already reference preserved IDs, so no row-level rewiring is needed.

-- CreateIndex
CREATE UNIQUE INDEX "roles_organizationId_name_key" ON "roles"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_organizationId_resource_key" ON "permissions"("organizationId", "resource");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
