import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Building2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WorkspaceCardProps extends HTMLMotionProps<"div"> {
  name: string;
  agents: number;
  members: number;
  isSelecting?: boolean;
  onOpen: () => void;
}

export function WorkspaceCard({
  className,
  name,
  agents,
  members,
  isSelecting = false,
  onOpen,
  ...props
}: WorkspaceCardProps) {
  const keyframes = `
    @keyframes promo-card-loader-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-lg",
        className
      )}
      {...props}
    >
      <style>{keyframes}</style>

      <svg className="pointer-events-none absolute -z-10 h-0 w-0" aria-hidden="true">
        <filter id="grainy-ws">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>

      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ filter: "url(#grainy-ws)" }} />

     

      <div className="relative z-10 flex h-full flex-col p-6">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-gray-900! text-white flex items-center justify-center shadow-md">
           
              <Building2 className="w-6 h-6" />
       
          </div>
          
        </div>

        <div className="mt-4 grow">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{name}</h3>
          <h4 className="text-sm text-muted-foreground">{agents} agents • {members} members</h4>
        </div>

        <div className="mt-4 flex justify-end shrink-0">
          <Button className="bg-sky-500! rounded-lg!" onClick={onOpen} disabled={isSelecting}>
            {isSelecting ? (
              <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening…</span>
            ) : (
              "Open Workspace"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


