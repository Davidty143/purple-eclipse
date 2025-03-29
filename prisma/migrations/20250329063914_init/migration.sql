/*
  Warnings:

  - You are about to drop the `forums` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "forums";

-- CreateTable
CREATE TABLE "Forum" (
    "forum_id" UUID NOT NULL,
    "forum_name" TEXT,
    "forum_description" TEXT,
    "forum_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "forum_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forum_modified" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Forum_pkey" PRIMARY KEY ("forum_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Forum_forum_name_key" ON "Forum"("forum_name");
