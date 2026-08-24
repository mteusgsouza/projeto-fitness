import Link from "next/link";
import { CalendarOff, Play } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import HistoricosCard from "@/components/historicos";
import MainLayout from "@/components/main-layout";
import TreinosCard from "@/components/treinos";
import TrainingCalendarCard from "@/components/training-calendar";
import { getTrainingCalendar } from "@/actions/stats/_actions";
import { todayTrainingDay, trainingDayLabel } from "@/lib/training-day";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await currentUser()
  if (!user) return null

  const dayOfWeek = todayTrainingDay()

  const [calendar, todayTraining] = await Promise.all([
    getTrainingCalendar(0),
    prisma.training.findFirst({
      where: { userId: user.id, trainingDay: dayOfWeek },
      select: { id: true, label: true, _count: { select: { exercises: true } } },
    }),
  ])

  const firstName = user.firstName?.trim() || user.fullName || ''

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div>
          <p className="label-tec text-muted-foreground">
            {trainingDayLabel(dayOfWeek)}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {firstName}
          </h1>
        </div>

        {/* Treino de hoje: a ação mais provável ao abrir o app */}
        {todayTraining && todayTraining._count.exercises > 0 ? (
          <Card className="border-primary/40">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Badge variant="secondary" className="mb-1">Hoje</Badge>
                <p className="truncate text-lg font-semibold">{todayTraining.label}</p>
                <p className="text-sm text-muted-foreground tabular">
                  {todayTraining._count.exercises} exercícios
                </p>
              </div>
              <Link href={`/workout/${todayTraining.id}`} passHref>
                <Button size="lg" className="shrink-0">
                  <Play className="size-4 fill-current" /> Treinar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <CalendarOff className="size-4" />
            <AlertTitle>Sem treino para hoje</AlertTitle>
            <AlertDescription>
              {todayTraining
                ? 'A ficha de hoje ainda não tem exercícios.'
                : 'Nenhuma ficha cadastrada para este dia da semana.'}{' '}
              <Link href={todayTraining ? `/training/update/${todayTraining.id}` : '/training/create'}
                className="underline underline-offset-2">
                {todayTraining ? 'Adicionar exercícios' : 'Criar ficha'}
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {calendar && <TrainingCalendarCard initial={calendar} />}

        <div className="grid gap-4 md:grid-cols-2">
          <HistoricosCard />
          <TreinosCard />
        </div>
      </div>
    </MainLayout>
  );
}
