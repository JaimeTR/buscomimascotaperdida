"use client"

import { motion, useReducedMotion } from "framer-motion"

// Aparece suavemente al entrar en pantalla (una sola vez). Respeta prefers-reduced-motion.
export function Reveal({ children, delay = 0, className, as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" }) {
    const reduce = useReducedMotion()
    const Tag = motion[as]
    return (
        <Tag
            className={className}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
        >
            {children}
        </Tag>
    )
}
