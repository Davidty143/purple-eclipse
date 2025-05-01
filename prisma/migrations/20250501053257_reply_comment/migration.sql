-- CreateTable
CREATE TABLE "direct_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "is_read" BOOLEAN DEFAULT false,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_direct_messages_receiver" ON "direct_messages"("receiver_id");

-- CreateIndex
CREATE INDEX "idx_direct_messages_sender" ON "direct_messages"("sender_id");
