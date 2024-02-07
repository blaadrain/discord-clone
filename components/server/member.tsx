"use client";

import { cn } from "@/lib/utils";
import { Member, Profile, Server } from "@prisma/client";
import { Crown, Wrench } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../user-avatar";

type ServerMemberProps = {
  member: Member & { profile: Profile };
  server: Server;
};

const roleIconMap = {
  GUEST: null,
  MODERATOR: <Wrench className="h-4 w-4 text-indigo-500" />,
  ADMIN: <Crown className="h-4 w-4 text-yellow-500" />,
};

export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  // @ts-ignore
  const icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group mb-1 flex w-full items-center gap-x-2 rounded-md p-2 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50",
        params?.memberId === member.id && "bg-zinc-700/20 dark:bg-zinc-700",
      )}
    >
      <UserAvatar
        src={member.profile.imageUrl}
        className="h-8 w-8 md:h-6 md:w-6"
      />
      <p
        className={cn(
          "max-w-36 truncate text-sm font-semibold text-zinc-500 transition group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300",
          params?.memberId === member.id &&
            "text-primary dark:text-zinc-200 dark:group-hover:text-white",
        )}
      >
        {member.profile.name}
      </p>
      {icon}
    </button>
  );
};
