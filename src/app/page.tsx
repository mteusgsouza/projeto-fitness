import HistoricosCard from "@/components/historicos";
import MainLayout from "@/components/main-layout";
import TreinosCard from "@/components/treinos";
import { FrequencyChart, VolumeChart } from "@/components/charts/weekly-charts";
import ExerciseProgressChart from "@/components/charts/exercise-progress";
import { getExerciseProgress, getTrackedExercises, getWeeklyStats } from "@/actions/stats/_actions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser()
  if (!user) return null

  const [weekly, trackedExercises] = await Promise.all([
    getWeeklyStats(12),
    getTrackedExercises(),
  ])

  const hasSessions = weekly.some((point) => point.sessions > 0)
  const firstExercise = trackedExercises[0]
  const initialProgress = firstExercise
    ? await getExerciseProgress(firstExercise.id)
    : []

  const firstName = user.firstName?.trim() || user.fullName || ''

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {firstName}
          </h1>
        </div>

        {hasSessions && (
          <div className="grid gap-4 md:grid-cols-2">
            <FrequencyChart data={weekly} />
            <VolumeChart data={weekly} />
            {firstExercise && (
              <div className="md:col-span-2">
                <ExerciseProgressChart
                  exercises={trackedExercises}
                  initialExerciseId={firstExercise.id}
                  initialData={initialProgress}
                />
              </div>
            )}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <HistoricosCard />
          <TreinosCard />
        </div>
      </div>
    </MainLayout>
  );
}
