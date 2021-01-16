/*
  Warnings:

  - You are about to drop the column `iv` on the `Password` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Password" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stored" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Password" ("id", "name", "stored", "salt", "userId") SELECT "id", "name", "stored", "salt", "userId" FROM "Password";
DROP TABLE "Password";
ALTER TABLE "new_Password" RENAME TO "Password";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
