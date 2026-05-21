-- CreateTable
CREATE TABLE "chat_summaries" (
    "id" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "fromIndex" INTEGER NOT NULL,
    "toIndex" INTEGER NOT NULL,
    "mood" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "topicsJson" JSONB,
    "decisionsJson" JSONB,
    "questionsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tripId" TEXT NOT NULL,

    CONSTRAINT "chat_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_summaries_tripId_blockNumber_idx" ON "chat_summaries"("tripId", "blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "chat_summaries_tripId_blockNumber_key" ON "chat_summaries"("tripId", "blockNumber");

-- AddForeignKey
ALTER TABLE "chat_summaries" ADD CONSTRAINT "chat_summaries_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
