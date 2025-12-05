"use client";

import { Play, Maximize2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const VideoDemo = () => {
  return (
    <section className="py-16 md:py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6 tracking-tight">
              See Yetti in <span className="text-sky-500/80">Action</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Watch how Yetti.ai seamlessly handles customer conversations, 
              boosts engagement, and drives sales on autopilot.
            </p>
          </motion.div>
        </div>

        {/* Video Container with Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-2xl overflow-hidden">
            {/* Browser Header */}
            <div className="h-12 bg-white/80 border-b border-gray-100 flex items-center px-4 gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-64 bg-gray-100/50 rounded-full flex items-center justify-center text-[10px] text-gray-400 font-medium">
                  yetti.ai/demo
                </div>
              </div>
              <div className="flex gap-2 text-gray-400">
                <MoreHorizontal size={16} />
              </div>
            </div>

            {/* Video Area */}
            <div className="relative aspect-video bg-slate-900 group cursor-pointer overflow-hidden">
              {/* Placeholder Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-sky-900/20 opacity-90"></div>
              
              {/* Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"></div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/40 group-hover:bg-sky-500 transition-colors">
                      <Play className="w-6 h-6 text-white fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls Mockup */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent flex items-end px-6 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full flex items-center justify-between text-white/80">
                  <div className="flex gap-4 text-sm font-medium">
                    <span>0:00</span>
                    <div className="w-96 h-1.5 bg-white/20 rounded-full my-auto relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-sky-500 rounded-full"></div>
                    </div>
                    <span>2:14</span>
                  </div>
                  <Maximize2 size={18} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Glow Behind */}
          <div className="absolute -inset-4 bg-sky-500/20 blur-3xl -z-10 rounded-[3rem] opacity-40"></div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoDemo;
