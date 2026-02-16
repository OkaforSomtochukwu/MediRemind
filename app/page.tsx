'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, Clock, Activity, CheckCircle, Shield, Smartphone, Zap } from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Never Miss a <span className="text-teal-500">Dose</span> Again.
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 mb-10">
              The simple, smart, and secure way to track your daily medications.
              Stay healthy with intelligent reminders and progress tracking.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 text-lg font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </motion.div>

          {/* Mockup Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative w-full max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden aspect-[16/9] flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-50 to-white dark:from-slate-900 dark:to-slate-800 opacity-50" />
              <div className="z-10 text-center p-8">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Your Dashboard</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Clean, intuitive, and distraction-free.</p>
              </div>
              {/* Decorative Dashboard Elements */}
              <div className="absolute top-4 left-4 right-4 h-full bg-slate-50 dark:bg-slate-950 rounded-t-xl border-t border-l border-r border-slate-200 dark:border-slate-800 opacity-50 transform translate-y-12 transition-transform group-hover:translate-y-8" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-10 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            {[
              { icon: Zap, label: "Works on All Devices", desc: "Mobile, Tablet, Desktop" },
              { icon: Shield, label: "Privacy Focused", desc: "Local Storage Only" },
              { icon: CheckCircle, label: "100% Free", desc: "No Ads, No Sign-up" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="h-8 w-8 text-teal-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{stat.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Everything in one place
            </h2>
            <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
              Essential features designed for your peace of mind.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: Clock,
                title: "Smart Scheduling",
                desc: "Set flexible schedules: daily, weekly, or as needed reminders."
              },
              {
                icon: Activity,
                title: "Progress Tracking",
                desc: "Visualize your adherence streaks and weekly stats instantly."
              },
              {
                icon: Bell,
                title: "Browser Notifications",
                desc: "Get timely alerts right on your device so you stay on track."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800" />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-base text-slate-500 dark:text-slate-400 text-center">
            &copy; {new Date().getFullYear()} MediRemind. Built with ❤️ for better health.
          </p>
          <div className="mt-4 flex space-x-6">
            <span className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 cursor-pointer">Privacy</span>
            <span className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 cursor-pointer">Terms</span>
            <span className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
