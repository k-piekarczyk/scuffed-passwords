/*
  Warnings:

  - You are about to drop the column `used` on the `ActivationToken` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivationToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "issued" DATETIME NOT NULL,
    "expires" DATETIME NOT NULL,
    "invalid" BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivationToken" ("id", "userId", "value", "issued", "expires") SELECT "id", "userId", "value", "issued", "expires" FROM "ActivationToken";
DROP TABLE "ActivationToken";
ALTER TABLE "new_ActivationToken" RENAME TO "ActivationToken";
CREATE UNIQUE INDEX "ActivationToken.value_unique" ON "ActivationToken"("value");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
