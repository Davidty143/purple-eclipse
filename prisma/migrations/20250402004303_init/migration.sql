-- CreateTable
CREATE TABLE "Thread" (
    "thread_id" SERIAL NOT NULL,
    "thread_title" TEXT NOT NULL,
    "thread_content" TEXT NOT NULL,
    "thread_deleted" BOOLEAN NOT NULL DEFAULT false,
    "thread_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thread_modified" TIMESTAMPTZ NOT NULL,
    "subforum_id" INTEGER NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("thread_id")
);

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_subforum_id_fkey" FOREIGN KEY ("subforum_id") REFERENCES "Subforum"("subforum_id") ON DELETE RESTRICT ON UPDATE CASCADE;
