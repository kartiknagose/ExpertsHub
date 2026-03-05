/*
  Warnings:

  - A unique constraint covering the columns `[workerId,dayOfWeek,startTime,endTime]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Availability_workerId_dayOfWeek_startTime_endTime_key" ON "Availability"("workerId", "dayOfWeek", "startTime", "endTime");
