import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./header";

type ServerSidebarProps = {
  serverId: string;
};

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();
  const server = await db.server.findUnique({
    where: { id: serverId },
    include: {
      channels: { orderBy: { createdAt: "asc" } },
      members: { include: { profile: true }, orderBy: { role: "asc" } },
    },
  });

  const textChannels = server?.channels.filter(
    (channel: { type: ChannelType }) => channel.type === ChannelType.TEXT,
  );
  const audioChannels = server?.channels.filter(
    (channel: { type: ChannelType }) => channel.type === ChannelType.AUDIO,
  );
  const videoChannels = server?.channels.filter(
    (channel: { type: ChannelType }) => channel.type === ChannelType.VIDEO,
  );
  const members = server?.members.filter(
    (member: { profileId: string }) => member.profileId !== profile.id,
  );

  if (!profile) return redirect("/");
  if (!server) return redirect("/");

  const role = server.members.find(
    (member: { profileId: string }) => member.profileId === profile.id,
  )?.role;

  return (
    <div className="flex h-full w-full flex-col bg-[#f2f3f5] text-primary dark:bg-[#2b2d31]">
      <ServerHeader server={server} role={role} />
    </div>
  );
};
