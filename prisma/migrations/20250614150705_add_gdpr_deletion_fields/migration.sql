-- CreateTable
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "_prisma_migrations_migration_name_key" ON "_prisma_migrations"("migration_name"); 