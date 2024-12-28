import HistoricosCard from "@/components/historicos";
import MainLayout from "@/components/main-layout";
import TreinosCard from "@/components/treinos";
import { SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser()

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:p-6">
        <h1 className="text-xl md:text-2xl">
          Bem vindo, {user?.fullName}
        </h1>
        <div className="mt-8">
          <SignedIn>
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
