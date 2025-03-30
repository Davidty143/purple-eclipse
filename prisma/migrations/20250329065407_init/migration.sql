-- CreateTable
CREATE TABLE "Subforum" (
    "subforum_id" SERIAL NOT NULL,
    "subforum_name" TEXT,
    "subforum_description" TEXT,
    "subforum_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "subforum_created" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subforum_modified" TIMESTAMPTZ NOT NULL,
    "forum_id" UUID NOT NULL,

    CONSTRAINT "Subforum_pkey" PRIMARY KEY ("subforum_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subforum_subforum_name_key" ON "Subforum"("subforum_name");

-- AddForeignKey
ALTER TABLE "Subforum" ADD CONSTRAINT "Subforum_forum_id_fkey" FOREIGN KEY ("forum_id") REFERENCES "Forum"("forum_id") ON DELETE RESTRICT ON UPDATE CASCADE;
