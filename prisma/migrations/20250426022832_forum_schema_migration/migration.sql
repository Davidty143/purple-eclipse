/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "avatar_url",
ADD COLUMN     "account_avatar_url" TEXT;
