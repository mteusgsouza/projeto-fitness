-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "tracking" TEXT NOT NULL DEFAULT 'reps',
ADD COLUMN     "usesDistance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SetLog" ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "durationSeconds" INTEGER,
ALTER COLUMN "reps" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TrainingExercise" ADD COLUMN     "durationSeconds" INTEGER,
ALTER COLUMN "reps" DROP NOT NULL;

