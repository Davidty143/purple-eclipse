-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "comment_content" TEXT NOT NULL,
    "comment_deleted" BOOLEAN NOT NULL DEFAULT false,
    "comment_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment_modified" TIMESTAMPTZ NOT NULL,
    "thread_id" INTEGER NOT NULL,
    "author_id" UUID NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE INDEX "Comment_thread_id_idx" ON "Comment"("thread_id");

-- CreateIndex
CREATE INDEX "Comment_author_id_idx" ON "Comment"("author_id");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "Account"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
