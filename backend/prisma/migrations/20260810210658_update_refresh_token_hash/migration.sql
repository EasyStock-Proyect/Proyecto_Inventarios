/*
  Warnings:

  - You are about to drop the column `token` on the `refresh_token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tokenHash]` on the table `refresh_token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `refresh_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "refresh_token_token_key";

-- AlterTable
ALTER TABLE "refresh_token" DROP COLUMN "token",
ADD COLUMN     "tokenHash" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_tokenHash_key" ON "refresh_token"("tokenHash");
