PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Portfolio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Portfolio" ("id", "displayName", "headline", "bio", "createdAt", "updatedAt")
SELECT "id", "displayName", "headline", "bio", "createdAt", "updatedAt" FROM "Portfolio";

DROP TABLE "Portfolio";

ALTER TABLE "new_Portfolio" RENAME TO "Portfolio";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

