-- CreateTable
CREATE TABLE "WorkerLocation" (
    "id" SERIAL NOT NULL,
    "workerProfileId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerLocation_workerProfileId_key" ON "WorkerLocation"("workerProfileId");

-- AddForeignKey
ALTER TABLE "WorkerLocation" ADD CONSTRAINT "WorkerLocation_workerProfileId_fkey" FOREIGN KEY ("workerProfileId") REFERENCES "WorkerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
