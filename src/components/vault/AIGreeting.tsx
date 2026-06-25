"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AIGreetingProps {
  message: string;
}

export function AIGreeting({ message }: AIGreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 mb-4"
    >
      <div className="flex gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <p className="text-sm text-amber-800/90 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
