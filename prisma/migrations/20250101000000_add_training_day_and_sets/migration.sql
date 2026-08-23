-- Corrige drift: estas colunas foram aplicadas no banco via `prisma db push`,
-- sem migration correspondente. `IF NOT EXISTS` torna a migration um no-op em
-- bancos que já as possuem, e correta em um banco criado do zero.

ALTER TABLE "Training" ADD COLUMN IF NOT EXISTS "trainingDay" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Training" ALTER COLUMN "trainingDay" DROP DEFAULT;

ALTER TABLE "TrainingMenu" ADD COLUMN IF NOT EXISTS "sets" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TrainingMenu" ALTER COLUMN "sets" DROP DEFAULT;
