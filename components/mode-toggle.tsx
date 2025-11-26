"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sun, Moon } from "lucide-react"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative h-10 w-10 flex items-center justify-center rounded-full border bg-background shadow-sm hover:shadow transition"
        >
            <AnimatePresence mode="wait">
                {!isDark ? (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sun className="h-5 w-5 text-yellow-500" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: 45, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -45, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Moon className="h-5 w-5 text-blue-400" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}
