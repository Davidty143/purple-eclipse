-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_previlege_id_fkey";

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "previlege_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_previlege_id_fkey" FOREIGN KEY ("previlege_id") REFERENCES "Previlage"("previlege_id") ON DELETE SET NULL ON UPDATE CASCADE;
