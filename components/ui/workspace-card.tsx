import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Building2, Loader2, ArrowRight, Users, Bot } from "lucide-react";

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
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-1 transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-sky-500/10",
        className
      )}
      {...props}
    >
      <div className="relative h-full rounded-[20px] bg-slate-900/40 backdrop-blur-sm p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-sky-500/20 flex items-center justify-center ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-400">
            Personal
          </div>
        </div>

        {/* Content */}
        <div className="grow space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1  transition-colors">{name}</h3>
            <p className="text-sm text-slate-400">Workspace</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-sky-500" />
              <span>{agents} Agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>{members} Members</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <Button 
            className="w-full bg-white text-slate-900 hover:bg-white font-semibold h-11 rounded-xl shadow-lg shadow-black/20  transition-all" 
            onClick={onOpen} 
            disabled={isSelecting}
          >
            {isSelecting ? (
              <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening...</span>
            ) : (
              <span className="inline-flex items-center justify-center w-full">
                Open Workspace <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


