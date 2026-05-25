-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'FARMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('SEED', 'SPROUT', 'GROWING', 'BUDDING', 'BLOOMING', 'RESTING', 'NEEDS_CARE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MoodLevel" AS ENUM ('VERY_BAD', 'BAD', 'NORMAL', 'GOOD', 'VERY_GOOD');

-- CreateEnum
CREATE TYPE "GardenStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CareTaskType" AS ENUM ('WATER_PLANT', 'BREATHING', 'DRINK_WATER', 'WRITE_JOURNAL', 'LISTEN_SOUND', 'SHORT_WALK');

-- CreateEnum
CREATE TYPE "VerifyType" AS ENUM ('SELF_CONFIRM', 'TIMER', 'OPTIONAL_PHOTO');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('WATER', 'SUNLIGHT', 'FERTILIZER', 'AIR', 'LOVE', 'DEW');

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" UUID,
    "hashedToken" VARCHAR(255) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(150),
    "avatarUrl" VARCHAR(500),
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Garden" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(500),
    "description" TEXT,
    "imageUrl" VARCHAR(500),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "GardenStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "farmerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Garden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowerType" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageUrl" VARCHAR(500),
    "defaultDuration" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "FlowerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealPlant" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "status" "PlantStatus" NOT NULL DEFAULT 'SEED',
    "isAssigned" BOOLEAN NOT NULL DEFAULT false,
    "plantedAt" DATE,
    "completedAt" DATE,
    "flowerTypeId" UUID NOT NULL,
    "gardenId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RealPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualPlant" (
    "id" UUID NOT NULL,
    "nickname" VARCHAR(100),
    "status" "PlantStatus" NOT NULL DEFAULT 'SEED',
    "growthPoint" INTEGER NOT NULL DEFAULT 0,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,
    "flowerTypeId" UUID NOT NULL,
    "realPlantId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "VirtualPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantUpdate" (
    "id" UUID NOT NULL,
    "realPlantId" UUID NOT NULL,
    "farmerId" UUID NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "status" "PlantStatus" NOT NULL,
    "note" TEXT,
    "healthNote" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodJournal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "mood" "MoodLevel" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTask" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "CareTaskType" NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "rewardResource" "ResourceType" NOT NULL DEFAULT 'WATER',
    "rewardAmount" INTEGER NOT NULL DEFAULT 10,
    "growthReward" INTEGER NOT NULL DEFAULT 5,
    "verifyType" "VerifyType" NOT NULL DEFAULT 'SELF_CONFIRM',
    "durationSeconds" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTaskLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "virtualPlantId" UUID,
    "careTaskId" UUID NOT NULL,
    "taskDate" DATE NOT NULL,
    "completedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareTaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fcmToken" VARCHAR(500) NOT NULL,
    "platform" VARCHAR(50),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "type" VARCHAR(50),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "RefreshToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Garden_farmerId_idx" ON "Garden"("farmerId");

-- CreateIndex
CREATE INDEX "Garden_status_idx" ON "Garden"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FlowerType_name_key" ON "FlowerType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RealPlant_code_key" ON "RealPlant"("code");

-- CreateIndex
CREATE INDEX "RealPlant_gardenId_idx" ON "RealPlant"("gardenId");

-- CreateIndex
CREATE INDEX "RealPlant_flowerTypeId_idx" ON "RealPlant"("flowerTypeId");

-- CreateIndex
CREATE INDEX "RealPlant_flowerTypeId_isAssigned_status_idx" ON "RealPlant"("flowerTypeId", "isAssigned", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualPlant_realPlantId_key" ON "VirtualPlant"("realPlantId");

-- CreateIndex
CREATE INDEX "VirtualPlant_userId_idx" ON "VirtualPlant"("userId");

-- CreateIndex
CREATE INDEX "VirtualPlant_flowerTypeId_idx" ON "VirtualPlant"("flowerTypeId");

-- CreateIndex
CREATE INDEX "PlantUpdate_realPlantId_createdAt_idx" ON "PlantUpdate"("realPlantId", "createdAt");

-- CreateIndex
CREATE INDEX "PlantUpdate_farmerId_idx" ON "PlantUpdate"("farmerId");

-- CreateIndex
CREATE INDEX "MoodJournal_userId_idx" ON "MoodJournal"("userId");

-- CreateIndex
CREATE INDEX "CareTaskLog_userId_idx" ON "CareTaskLog"("userId");

-- CreateIndex
CREATE INDEX "CareTaskLog_virtualPlantId_idx" ON "CareTaskLog"("virtualPlantId");

-- CreateIndex
CREATE INDEX "CareTaskLog_careTaskId_idx" ON "CareTaskLog"("careTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "CareTaskLog_userId_careTaskId_taskDate_key" ON "CareTaskLog"("userId", "careTaskId", "taskDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_fcmToken_key" ON "UserDevice"("fcmToken");

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealPlant" ADD CONSTRAINT "RealPlant_flowerTypeId_fkey" FOREIGN KEY ("flowerTypeId") REFERENCES "FlowerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealPlant" ADD CONSTRAINT "RealPlant_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualPlant" ADD CONSTRAINT "VirtualPlant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualPlant" ADD CONSTRAINT "VirtualPlant_flowerTypeId_fkey" FOREIGN KEY ("flowerTypeId") REFERENCES "FlowerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualPlant" ADD CONSTRAINT "VirtualPlant_realPlantId_fkey" FOREIGN KEY ("realPlantId") REFERENCES "RealPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantUpdate" ADD CONSTRAINT "PlantUpdate_realPlantId_fkey" FOREIGN KEY ("realPlantId") REFERENCES "RealPlant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantUpdate" ADD CONSTRAINT "PlantUpdate_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodJournal" ADD CONSTRAINT "MoodJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTaskLog" ADD CONSTRAINT "CareTaskLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTaskLog" ADD CONSTRAINT "CareTaskLog_virtualPlantId_fkey" FOREIGN KEY ("virtualPlantId") REFERENCES "VirtualPlant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareTaskLog" ADD CONSTRAINT "CareTaskLog_careTaskId_fkey" FOREIGN KEY ("careTaskId") REFERENCES "CareTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
