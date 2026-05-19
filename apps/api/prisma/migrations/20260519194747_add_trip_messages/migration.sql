-- CreateTable
CREATE TABLE "trip_messages" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tripId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "trip_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_messages_tripId_createdAt_idx" ON "trip_messages"("tripId", "createdAt");

-- AddForeignKey
ALTER TABLE "trip_messages" ADD CONSTRAINT "trip_messages_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_messages" ADD CONSTRAINT "trip_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
