/*
  Warnings:

  - Added the required column `salt` to the `Password` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Password` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Password" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stored" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Password" ("id", "name", "stored", "userId") SELECT "id", "name", "stored", "userId" FROM "Password";
DROP TABLE "Password";
ALTER TABLE "new_Password" RENAME TO "Password";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
