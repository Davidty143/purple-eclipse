/*
  Warnings:

  - The primary key for the `Forum` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `forum_id` column on the `Forum` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `forum_id` on the `Subforum` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Subforum" DROP CONSTRAINT "Subforum_forum_id_fkey";

-- AlterTable
ALTER TABLE "Forum" DROP CONSTRAINT "Forum_pkey",
DROP COLUMN "forum_id",
ADD COLUMN     "forum_id" SERIAL NOT NULL,
ADD CONSTRAINT "Forum_pkey" PRIMARY KEY ("forum_id");

-- AlterTable
ALTER TABLE "Subforum" DROP COLUMN "forum_id",
ADD COLUMN     "forum_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Subforum" ADD CONSTRAINT "Subforum_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("forum_id") ON DELETE RESTRICT ON UPDATE CASCADE;
