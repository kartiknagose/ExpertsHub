-- AddForeignKey
ALTER TABLE "SOSAlert" ADD CONSTRAINT "SOSAlert_triggeredBy_fkey" FOREIGN KEY ("triggeredBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "SOSAlert_triggeredBy_idx" ON "SOSAlert"("triggeredBy");
