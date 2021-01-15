-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Password" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stored" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "issued" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "issued" DATETIME NOT NULL,
    "expires" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session.token_unique" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Token.value_unique" ON "Token"("value");
