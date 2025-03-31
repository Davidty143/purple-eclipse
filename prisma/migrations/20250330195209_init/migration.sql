/*
  Warnings:

  - You are about to drop the column `forum_is_deleted` on the `Forum` table. All the data in the column will be lost.
  - You are about to drop the column `subforum_is_deleted` on the `Subforum` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Forum" DROP COLUMN "forum_is_deleted",
ADD COLUMN     "forum_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Subforum" DROP COLUMN "subforum_is_deleted",
ADD COLUMN     "subforum_deleted" BOOLEAN NOT NULL DEFAULT false;
