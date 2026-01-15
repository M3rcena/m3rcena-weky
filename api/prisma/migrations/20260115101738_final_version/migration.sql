/*
  Warnings:

  - A unique constraint covering the columns `[botID]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bot" ALTER COLUMN "inits" SET DEFAULT 1,
ALTER COLUMN "totalRequests" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_botID_key" ON "ApiKey"("botID");
