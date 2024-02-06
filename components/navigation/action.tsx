"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
  const { onOpen } = useModal();

  return (
    <div>
      <ActionTooltip side="right" align="center" label="Add a server">
        <button
          onClick={() => onOpen("createServer")}
          className="group flex items-center"
        >
          <div className="darl:bg-neutral-700 mx-3 flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-[24px] border-[1px] bg-background transition-all group-hover:rounded-[16px] group-hover:bg-emerald-500">
            <Plus
              className="text-emerald-500 transition group-hover:text-white"
              size={24}
            />
          </div>
        </button>
      </ActionTooltip>
    </div>
  );
};
