import MainLayout from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser()

  const treinos = await prisma.training.findMany({
    where: {
      userId: user?.id
    }
  })

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:p-6">
        <h1 className="text-2xl">
          Bem vindo, {user?.fullName}
        </h1>
        <div className="mt-8">
          <SignedIn>
            <Card className="w-[350px]">
              <CardHeader>
                <CardTitle>
                  <CardTitle>Treinos</CardTitle>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {treinos?.map((treino) => (
                    <li key={treino.id}>
                      {treino.label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </SignedIn>
        </div>
      </div>
    </MainLayout>
  );
}
