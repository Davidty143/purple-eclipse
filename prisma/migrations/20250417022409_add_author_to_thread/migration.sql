/*
  Warnings:

  - Added the required column `author_id` to the `Thread` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Thread" ADD COLUMN     "author_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Thread_author_id_idx" ON "Thread"("author_id");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
