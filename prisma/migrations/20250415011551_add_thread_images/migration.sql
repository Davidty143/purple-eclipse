-- CreateTable
CREATE TABLE "thread_image" (
    "thread_image_id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thread_id" INTEGER NOT NULL,

    CONSTRAINT "thread_image_pkey" PRIMARY KEY ("thread_image_id")
);

-- CreateIndex
CREATE INDEX "thread_image_thread_id_idx" ON "thread_image"("thread_id");

-- AddForeignKey
ALTER TABLE "thread_image" ADD CONSTRAINT "thread_image_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "Thread"("thread_id") ON DELETE RESTRICT ON UPDATE CASCADE;
