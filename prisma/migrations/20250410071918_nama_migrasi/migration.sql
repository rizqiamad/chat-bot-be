/*
  Warnings:

  - You are about to drop the column `userId` on the `Bots` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `Bots` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bots" DROP CONSTRAINT "Bots_userId_fkey";

-- AlterTable
ALTER TABLE "Bots" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Bots" ADD CONSTRAINT "Bots_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
