import React from 'react';
import { BadgeCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const VerifiedBadge = ({ isVerified }) => {
  if (!isVerified) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Using a span wrapper ensures layout stability */}
          <span className="inline-flex items-center align-middle">
             <BadgeCheck className="ml-1 h-5 w-5 text-blue-500" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Tradesperson</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;