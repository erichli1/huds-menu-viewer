-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);
