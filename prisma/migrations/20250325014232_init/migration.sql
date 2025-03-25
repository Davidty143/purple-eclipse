/*
  Warnings:

  - You are about to drop the column `account_iscreated_timestamp` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `account_modified_timestamp` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `account_photo_url` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `previlege_id` on the `Role` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role_type]` on the table `Role` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_previlege_id_fkey";

-- DropIndex
DROP INDEX "Account_account_id_key";

-- DropIndex
DROP INDEX "Previlage_previlege_id_key";

-- DropIndex
DROP INDEX "Role_role_id_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "account_iscreated_timestamp",
DROP COLUMN "account_modified_timestamp",
DROP COLUMN "account_photo_url";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "previlege_id";

-- CreateTable
CREATE TABLE "_PrevilageToRole" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PrevilageToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PrevilageToRole_B_index" ON "_PrevilageToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_type_key" ON "Role"("role_type");

-- AddForeignKey
ALTER TABLE "_PrevilageToRole" ADD CONSTRAINT "_PrevilageToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Previlage"("previlege_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PrevilageToRole" ADD CONSTRAINT "_PrevilageToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;
