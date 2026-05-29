/*
  Warnings:

  - You are about to drop the column `roleName` on the `memberships` table. The data in this column will be preserved until role backfill completes.

*/
-- AlterTable
ALTER TABLE "memberships"
ADD COLUMN     "roleId" TEXT;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Create roles for existing memberships using the old roleName values.
INSERT INTO "Role" ("id", "name", "organizationId", "createdAt", "updatedAt")
SELECT md5("organizationId" || '|' || "roleName"),
       "roleName",
       "organizationId",
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "memberships"
WHERE "roleName" IS NOT NULL
GROUP BY "organizationId", "roleName";

-- Populate memberships.roleId from the created roles.
UPDATE "memberships"
SET "roleId" = r."id"
FROM "Role" r
WHERE "memberships"."organizationId" = r."organizationId"
  AND "memberships"."roleName" = r."name";

-- Remove the old roleName column after backfill.
ALTER TABLE "memberships" DROP COLUMN "roleName";

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_organizationId_name_key" ON "Role"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_organizationId_key_key" ON "Permission"("organizationId", "key");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
