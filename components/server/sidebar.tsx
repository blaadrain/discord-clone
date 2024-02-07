import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Channel, ChannelType, Member, MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { ServerHeader } from "./header";
import { ScrollArea } from "../ui/scroll-area";
import { ServerSearch } from "./search";
import { Crown, Hash, Mic, Video, Wrench } from "lucide-react";
import { Separator } from "../ui/separator";
import { ServerSection } from "./section";
import { ServerChannel } from "./channel";
import { ServerMember } from "./member";

type ServerSidebarProps = {
  serverId: string;
};

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-5 w-5" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-5 w-5" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-5 w-5" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: <Wrench className="mr-2 h-5 w-5 text-indigo-500" />,
  [MemberRole.ADMIN]: <Crown className="mr-2 h-5 w-5 text-yellow-500" />,
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
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  // @ts-ignore
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  // @ts-ignore
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel: Channel) => ({
                  id: channel.id,
                  name: channel.name,
                  // @ts-ignore
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member: Member) => ({
                  id: member.id,
                  name: member.profile.name,
                  // @ts-ignore
                  icon: roleIconMap[member.type],
                })),
              },
            ]}
          />
        </div>
        <Separator className="my-2 h-[2px] rounded-md bg-zinc-300 dark:bg-zinc-700" />

        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              label="Text Channels"
              role={role}
              sectionType="channels"
              channelType={ChannelType.TEXT}
            />
            <div className="space-y-[2px]">
              {textChannels.map((channel: Channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!audioChannels?.length && (
          <div className="mb-2">
            <ServerSection
              label="Voice Channels"
              role={role}
              sectionType="channels"
              channelType={ChannelType.AUDIO}
            />
            <div className="space-y-[2px]">
              {audioChannels.map((channel: Channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!videoChannels?.length && (
          <div className="mb-2">
            <ServerSection
              label="Video Channels"
              role={role}
              sectionType="channels"
              channelType={ChannelType.VIDEO}
            />
            <div className="space-y-[2px]">
              {videoChannels.map((channel: Channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  server={server}
                  role={role}
                />
              ))}
            </div>
          </div>
        )}
        {!!members?.length && (
          <div className="mb-2">
            <ServerSection
              label="Members"
              role={role}
              sectionType="members"
              server={server}
            />
            <div className="space-y-[2px]">
              {members.map((member: Member) => (
                <ServerMember key={member.id} member={member} server={server} />
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
