-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StyleSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navbarOrientation" TEXT NOT NULL DEFAULT 'HORIZONTAL',
    "primaryColor" TEXT NOT NULL DEFAULT '#0ea5e9',
    "secondaryColor" TEXT NOT NULL DEFAULT '#111827',
    "accentColor" TEXT NOT NULL DEFAULT '#22d3ee',
    "cursorStyle" TEXT NOT NULL DEFAULT 'GLOW_WINDY',
    "showCursor" BOOLEAN NOT NULL DEFAULT true,
    "align" TEXT NOT NULL DEFAULT 'CENTER',
    "enable3DScene" BOOLEAN NOT NULL DEFAULT true,
    "scene3DType" TEXT NOT NULL DEFAULT 'ANIMATED_SPHERE',
    "scene3DColor" TEXT NOT NULL DEFAULT '#0ea5e9',
    "scene3DSpeed" REAL NOT NULL DEFAULT 1.0,
    "portfolioId" INTEGER NOT NULL,
    CONSTRAINT "StyleSettings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StyleSettings" ("accentColor", "align", "cursorStyle", "id", "navbarOrientation", "portfolioId", "primaryColor", "secondaryColor", "showCursor") SELECT "accentColor", "align", "cursorStyle", "id", "navbarOrientation", "portfolioId", "primaryColor", "secondaryColor", "showCursor" FROM "StyleSettings";
DROP TABLE "StyleSettings";
ALTER TABLE "new_StyleSettings" RENAME TO "StyleSettings";
CREATE UNIQUE INDEX "StyleSettings_portfolioId_key" ON "StyleSettings"("portfolioId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
