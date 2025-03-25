/*
  Warnings:

  - You are about to drop the column `website_url` on the `University` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "website_url",
ADD COLUMN     "websiteUrl" TEXT;
