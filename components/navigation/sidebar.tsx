import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationAction } from "./action";
import { NavigationItem } from "./item";
import { ThemeToggle } from "../theme-toggle";
import { UserButton } from "@clerk/nextjs";

export const NavigationSidebar = async () => {
  const profile = await currentProfile();

  if (!profile) return redirect("/");

  const servers = await db.server.findMany({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  return (
    <nav className="flex h-full w-full flex-col items-center space-y-4 bg-[#e3e5e8] py-3 text-primary dark:bg-[#1e1f22]">
      <NavigationAction />
      <Separator className="mx-auto h-[2px] w-10 rounded-md bg-zinc-300 dark:bg-zinc-700" />
      <ScrollArea className="w-full flex-1">
        {servers.map(
          (server: { id: string; imageUrl: string; name: string }) => (
            <div key={server.id} className="mb-4">
              <NavigationItem
                id={server.id}
                imageUrl={server.imageUrl}
                name={server.name}
              />
            </div>
          ),
        )}
      </ScrollArea>
      <div className="mt-auto flex flex-col items-center gap-y-4 p-3">
        <ThemeToggle />
        <UserButton
          afterSignOutUrl="/"
          appearance={{ elements: { avatarBox: "h-[48px] w-[48px]" } }}
        />
      </div>
    </nav>
  );
};
