import MainLayout from "@/components/main-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser()

  const treinos = await prisma.training.findMany({
    where: {
      userId: user?.id
    }
  })

  const historicos = await prisma.trainingHistory.findMany({
    where: {
      userId: user?.id
    },
    select: {
      id: true,
      createdAt: true,
      training: true,
    }
  })

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:p-6">
        <h1 className="text-xl md:text-2xl">
          Bem vindo, {user?.fullName}
        </h1>
        <div className="mt-8">
          <SignedIn>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <h1>Historico de treinos:</h1>
                {historicos?.length ?
                  (<Card>
                    <CardHeader>
                      <CardTitle>
                        <CardTitle>Atividade</CardTitle>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul>
                        {historicos?.map((historico) => (
                          <li key={historico.id}>
                            {historico.createdAt.getDate()}-
                            treino:{historico.training.label}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>)
                  :
                  <Link href="/training/create">
                    <Alert className="cursor-pointer hover:bg-muted">
                      <AlertCircle className="w-4 h-4" />
                      <AlertTitle>Nenhum treino realizado</AlertTitle>
                      <AlertDescription className="">
                        Você ainda não tem treinos cadastrados, clique aqui para começar
                      </AlertDescription>
                    </Alert>
                  </Link>
                }
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <CardTitle>Treinos</CardTitle>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul>
                    {treinos?.map((treino) => (
                      <li key={treino.id}>
                        <span className="capitalize mr-0.5">{treino.trainingDay}</span> - {treino.label}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

            </div>
          </SignedIn>
        </div>
      </div>
    </MainLayout>
  );
}
