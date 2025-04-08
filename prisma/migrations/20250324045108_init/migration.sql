/*
  Warnings:

  - You are about to drop the column `note` on the `Attandance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attandance" DROP COLUMN "note",
ADD COLUMN     "note_in" TEXT,
ADD COLUMN     "note_out" TEXT;
