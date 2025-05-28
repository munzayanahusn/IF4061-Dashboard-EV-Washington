// components/BackButton.jsx
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ onClick }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className="w-fit cursor-pointer mb-0 transition-opacity hover:opacity-80 active:opacity-80"
          >
            <ArrowLeft className="w-10 h-10 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Back to Washington (All County)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
