PRAGMA foreign_keys=OFF;

ALTER TABLE "Portfolio" ADD COLUMN "summarySnippets" TEXT;

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

