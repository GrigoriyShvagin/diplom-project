/*
  Warnings:

  - Added the required column `createdById` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "votes" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ALTER COLUMN "type" SET DEFAULT 'single';

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
