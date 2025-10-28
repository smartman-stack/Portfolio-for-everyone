PRAGMA foreign_keys=OFF;

ALTER TABLE "Portfolio" ADD COLUMN "contactEmail" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Portfolio" ADD COLUMN "contactLocation" TEXT;

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

