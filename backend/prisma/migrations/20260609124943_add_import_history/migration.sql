-- CreateTable
CREATE TABLE "import_history" (
    "id" UUID NOT NULL,
    "import_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_count" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failed_count" INTEGER NOT NULL,
    "errors" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_history_uploaded_by_idx" ON "import_history"("uploaded_by");

-- CreateIndex
CREATE INDEX "import_history_import_type_idx" ON "import_history"("import_type");

-- AddForeignKey
ALTER TABLE "import_history" ADD CONSTRAINT "import_history_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
