/*
  Warnings:

  - Added the required column `conversationId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('PARTICIPANT', 'ADMIN', 'MODERATOR');

-- DropForeignKey
ALTER TABLE "property_inquiries" DROP CONSTRAINT "property_inquiries_inquirerId_fkey";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "conversationId" TEXT NOT NULL,
ADD COLUMN     "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "property_inquiries" ADD COLUMN     "conversationId" TEXT,
ADD COLUMN     "inquirerEmail" TEXT,
ADD COLUMN     "inquirerName" TEXT,
ADD COLUMN     "inquirerPhone" TEXT,
ADD COLUMN     "preferredContactMethod" TEXT,
ADD COLUMN     "requestViewing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "viewingDate" TIMESTAMP(3),
ADD COLUMN     "viewingTime" TEXT,
ADD COLUMN     "virtualViewingInterest" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "inquirerId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_inquirerId_fkey" FOREIGN KEY ("inquirerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
