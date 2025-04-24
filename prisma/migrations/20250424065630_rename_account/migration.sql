/*
  Warnings:

  - You are about to drop the column `account_avatar_url` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "account_avatar_url",
ADD COLUMN     "avatar_url" TEXT;
