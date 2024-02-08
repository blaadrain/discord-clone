"use client";

import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Crown, Edit, FileIcon, Trash, Wrench } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { useParams, useRouter } from "next/navigation";

type ChatMessageProps = {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  isDeleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
};

const roleIconMap = {
  GUEST: null,
  MODERATOR: <Wrench className="ml-3 h-4 w-4 text-indigo-500" />,
  ADMIN: <Crown className="ml-3 h-4 w-4 text-yellow-500" />,
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatMessage = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  isDeleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatMessageProps) => {
  const router = useRouter();
  const params = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();

  const onMemberClick = () => {
    if (member.id === currentMember.id) return;

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, values);

      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Escape" || e.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !isDeleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !isDeleted && isOwner && !fileUrl;
  const fileType = fileUrl?.split(".").pop();
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div className="group relative flex w-full items-center p-4 transition hover:bg-black/5">
      <div className="group flex w-full items-start gap-x-4">
        <div
          onClick={onMemberClick}
          className="cursor-pointer transition hover:drop-shadow-md"
        >
          <UserAvatar src={member.profile.imageUrl} />
        </div>
        <div className="flex w-full flex-col gap-y-1">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <span
                onClick={onMemberClick}
                className="cursor-pointer text-sm font-semibold hover:underline"
              >
                {member.profile.name}
              </span>
              <ActionTooltip label={member.role}>
                {/* @ts-ignore */}
                {roleIconMap[member.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-2 flex aspect-square h-48 w-48 items-center overflow-hidden rounded-md border bg-secondary"
            >
              <Image
                src={fileUrl}
                alt={content}
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative mr-auto mt-2 flex items-center rounded-md bg-background/10 px-4 py-2">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
              >
                PDF File
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                isDeleted && "mt-1 italic text-zinc-500 dark:text-zinc-400",
              )}
            >
              {content}
              {isUpdated && !isDeleted && (
                <span className="mx-2 text-xs text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="border-0 border-none bg-zinc-200/90 p-2 text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-zinc-700/75 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm" variant="primary">
                  Save
                </Button>
              </form>
              <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Press escape to cancel or enter to save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="absolute -top-2 right-5 hidden items-center gap-x-2 rounded-sm border bg-white p-1 group-hover:flex dark:bg-zinc-800">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 hover:dark:text-zinc-300"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${socketUrl}/${id}`,
                  query: socketQuery,
                })
              }
              className="ml-auto h-4 w-4 cursor-pointer text-zinc-500 transition hover:text-zinc-600 dark:text-zinc-400 hover:dark:text-zinc-300"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
