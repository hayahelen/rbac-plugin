/*
  Warnings:

  - You are about to drop the column `key` on the `Permission` table. All the data in the column will be lost after this migration step.
  - You are about to drop the `RolePermission` table. Existing assignments will be migrated into `role_permissions` before the drop.
  - A unique constraint covering the columns `[organizationId,resource]` on the table `Permission` will be added. If there are existing duplicate values after backfill, this will fail.
  - Added the required column `resource` to the `Permission` table as NULLABLE first, then backfilled before setting NOT NULL.

*/
-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropIndex
DROP INDEX "Permission_organizationId_key_key";

-- AlterTable
ALTER TABLE "Permission"
ADD COLUMN     "resource" TEXT,
ADD COLUMN     "canCreate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canDelete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canUpdate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Backfill resource for existing Permission rows using the old key.
UPDATE "Permission"
SET "resource" = CASE
  WHEN position('.' IN "key") > 0 THEN split_part("key", '.', 1)
  ELSE coalesce("key", 'unknown')
END
WHERE "resource" IS NULL;

-- Enforce non-null resource once backfill is complete.
ALTER TABLE "Permission" ALTER COLUMN "resource" SET NOT NULL;

-- Drop the old key column once resource is populated.
ALTER TABLE "Permission" DROP COLUMN "key";

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Migrate existing role assignments from old RolePermission.
INSERT INTO "role_permissions" ("id", "roleId", "permissionId", "createdAt")
SELECT md5("roleId" || '|' || "permissionId" || '|' || COALESCE("createdAt"::text, '')),
       "roleId",
       "permissionId",
       "createdAt"
FROM "RolePermission";

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_organizationId_resource_key" ON "Permission"("organizationId", "resource");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable
DROP TABLE "RolePermission";
