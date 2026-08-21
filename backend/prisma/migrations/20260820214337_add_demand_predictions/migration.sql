-- CreateTable
CREATE TABLE "demand_prediction" (
    "id" CHAR(36) NOT NULL,
    "userId" CHAR(36) NOT NULL,
    "productId" CHAR(36) NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "predictedQuantity" DECIMAL(10,2) NOT NULL,
    "lowerBound" DECIMAL(10,2) NOT NULL,
    "upperBound" DECIMAL(10,2) NOT NULL,
    "trainingStartDate" TIMESTAMP(3) NOT NULL,
    "trainingEndDate" TIMESTAMP(3) NOT NULL,
    "trainingDays" INTEGER NOT NULL,
    "hasEnoughData" BOOLEAN NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "demand_prediction_userId_productId_idx" ON "demand_prediction"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "demand_prediction_userId_productId_forecastDate_key" ON "demand_prediction"("userId", "productId", "forecastDate");

-- AddForeignKey
ALTER TABLE "demand_prediction" ADD CONSTRAINT "demand_prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_prediction" ADD CONSTRAINT "demand_prediction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
