/*
  Warnings:

  - You are about to drop the column `number` on the `Bots` table. All the data in the column will be lost.
  - Added the required column `phone` to the `Bots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bots" DROP COLUMN "number",
ADD COLUMN     "phone" TEXT NOT NULL;
