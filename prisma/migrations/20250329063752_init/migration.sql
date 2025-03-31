-- CreateTable
CREATE TABLE "forums" (
    "forum_id" UUID NOT NULL,
    "forum_name" TEXT,
    "forum_description" TEXT,
    "forum_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "forum_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "forum_modified" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "forums_pkey" PRIMARY KEY ("forum_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forums_forum_name_key" ON "forums"("forum_name");
