"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; // Strict Import Check Passed
import { Card } from "@/components/ui/card";
import { BookOpen, Trophy, Users, Zap, Gamepad2, Rocket } from "lucide-react";

const lessons = [
  {
    title: "Space Exploration",
    level: "Beginner",
    xp: 500,
    icon: Rocket,
    color: "from-blue-500 to-cyan-500",
    description: "Learn basic nouns related to space, planets, and stars."
  },
  {
    title: "Jungle Safari",
    level: "Intermediate",
    xp: 750,
    icon: Gamepad2,
    color: "from-green-500 to-emerald-500",
    description: "Discover animals and verbs while navigating the wild."
  },
  {
    title: "Magic Kingdom",
    level: "Advanced",
    xp: 1000,
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    description: "Master adjectives and storytelling in a fantasy world."
  }
];

export function Lessons() {
  return (
    <section className="py-24 bg-[#0B1120]">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <Badge variant="rainbow" className="mb-4">Mission Map</Badge>
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Path</h2>
          <p className="text-slate-400">Select a world to begin your learning journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {lessons.map((lesson, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-lg hover:border-white/20 transition-all duration-300 group cursor-pointer h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${lesson.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${lesson.color} flex items-center justify-center mb-6 shadow-lg`}>
                    <lesson.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{lesson.title}</h3>
                  <p className="text-slate-400 mb-6 flex-grow">{lesson.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <Badge variant="outline" className="border-white/20 text-slate-300">
                      {lesson.level}
                    </Badge>
                    <div className="flex items-center text-yellow-400 text-sm font-bold">
                      <Trophy className="w-4 h-4 mr-1" />
                      {lesson.xp} XP
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
