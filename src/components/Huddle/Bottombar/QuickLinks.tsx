import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { arbBlock, opBlock } from "@/config/staticDataUtils";
import React from "react";
import { PiLinkSimpleBold } from "react-icons/pi";
import clsx from "clsx";

function QuickLinks({ daoName }: { daoName: string }) {
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={clsx("bg-[#0a0a0a] hover:bg-[#0a0a0a] border-none")}>
            <div className="flex gap-2 items-center">
              <div className="bg-[#202020] hover:bg-gray-500/50 p-2 rounded-lg">
                <PiLinkSimpleBold
                  className="text-white"
                  size={24}
                ></PiLinkSimpleBold>
              </div>
              <div className="hidden lg:block text-white text-base">Quick Links</div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full bg-[#202020] text-white p-2 rounded-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            {/* <div className="arrow-up"></div> */}
            {(daoName === "arbitrum"
              ? arbBlock
              : daoName === "optimism"
              ? opBlock
              : []
            ).map((block, index) => (
              <a
                href={block.link}
                target="_blank"
                className="block px-4 py-2 bg-[#2f2f2f] hover:bg-gray-600/50 hover:rounded-md"
                key={index}
              >
                {block.title}
              </a>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default QuickLinks;
