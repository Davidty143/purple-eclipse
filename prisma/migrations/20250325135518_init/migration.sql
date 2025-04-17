-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_account_role_id_fkey";

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "account_status" DROP NOT NULL,
ALTER COLUMN "account_is_deleted" DROP NOT NULL,
ALTER COLUMN "account_role_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "role_type" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_account_role_id_fkey" FOREIGN KEY ("account_role_id") REFERENCES "Role"("role_id") ON DELETE SET NULL ON UPDATE CASCADE;
