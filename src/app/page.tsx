import HistoricosCard from "@/components/historicos";
import MainLayout from "@/components/main-layout";
import TreinosCard from "@/components/treinos";
import { FrequencyChart, VolumeChart } from "@/components/charts/weekly-charts";
import ExerciseProgressChart from "@/components/charts/exercise-progress";
import { getExerciseProgress, getTrackedExercises, getWeeklyStats } from "@/actions/stats/_actions";
import { SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser()

  const [weekly, trackedExercises] = await Promise.all([
    getWeeklyStats(12),
    getTrackedExercises(),
  ])

  const hasSessions = weekly.some((point) => point.sessions > 0)
  const firstExercise = trackedExercises[0]
  const initialProgress = firstExercise
    ? await getExerciseProgress(firstExercise.id)
    : []

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:p-6">
        <h1 className="text-xl md:text-2xl">
          Bem vindo, {user?.fullName}
        </h1>
        <div className="mt-8">
          <SignedIn>
            {hasSessions && (
              <div className="grid gap-3 md:grid-cols-2 mb-3">
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
            <div className="grid md:grid-cols-2 gap-3">
              <HistoricosCard />
              <TreinosCard />
            </div>
          </SignedIn>
        </div>
      </div>
    </MainLayout>
  );
}
