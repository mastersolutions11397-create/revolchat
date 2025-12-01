"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const platforms = [
  {
    image: "/yetti/instagram_logo.png",
    name: "Instagram",
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "group-hover:border-pink-500/50",
    shadow: "group-hover:shadow-pink-500/20",
  },
  {
    image: "/yetti/messenger_logo.png",
    name: "Messenger",
    color: "text-sky-500",
    bg: "bg-blue-50",
    border: "group-hover:border-blue-500/50",
    shadow: "group-hover:shadow-blue-500/20",
  },
  {
    image: "/yetti/telegram_logo.png",
    name: "Telegram",
    color: "text-sky-500",
    bg: "bg-sky-50",
    border: "group-hover:border-sky-500/50",
    shadow: "group-hover:shadow-sky-500/20",
  },
  {
    image: "/yetti/whatsapp_logo.png",
    name: "WhatsApp",
    color: "text-green-500",
    bg: "bg-green-50",
    border: "group-hover:border-green-500/50",
    shadow: "group-hover:shadow-green-500/20",
  },
  {
    image: "/yetti/twitter_logo.png",
    name: "X (Twitter)",
    color: "text-black",
    bg: "bg-gray-100",
    border: "group-hover:border-black/50",
    shadow: "group-hover:shadow-black/20",
  },
  {
    image: "/yetti/tiktok_logo.png",
    name: "TikTok",
    color: "text-black",
    bg: "bg-gray-100",
    border: "group-hover:border-black/50",
    shadow: "group-hover:shadow-black/20",
  },
  {
    image: "/yetti/linkedin_logo.png",
    name: "LinkedIn",
    color: "text-sky-500",
    bg: "bg-blue-50",
    border: "group-hover:border-sky-500/50",
    shadow: "group-hover:shadow-sky-500/20",
  },
  {
    image: "/yetti/discord_logo.png",
    name: "Discord",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    border: "group-hover:border-indigo-500/50",
    shadow: "group-hover:shadow-indigo-500/20",
  },
];

const Platforms = () => {
  return (
    <section className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-black font-lato text-foreground mb-6">
              Deploy Where Your <span className="text-sky-500">Customers Are</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Connect with your customers on their favorite platforms. Yetti
              integrates seamlessly across all major social channels.
            </p>
          </motion.div>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5 // Stagger floating animation
                }}
                className={`flex flex-col items-center text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-100 ${platform.border} transition-all duration-300 hover:shadow-xl ${platform.shadow} group cursor-pointer h-full relative overflow-hidden`}
              >
                {/* Hover Glow Background */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${platform.bg.replace('bg-', 'bg-')}`}></div>

                <div className={`relative mb-6 w-20 h-20 rounded-2xl ${platform.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Image
                    src={platform.image}
                    alt={`${platform.name} logo`}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <h3 className="relative text-lg font-bold text-foreground group-hover:text-sky-500 transition-colors">
                  {platform.name}
                </h3>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Platforms;
