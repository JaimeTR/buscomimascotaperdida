"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning" | "loading"

interface Toast {
    id: string
    title?: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toast: (message: string, options?: { title?: string, type?: ToastType, duration?: number }) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const toast = useCallback((message: string, options?: { title?: string, type?: ToastType, duration?: number }) => {
        const id = Math.random().toString(36).substr(2, 9)
        const type = options?.type || "info"
        const duration = options?.duration || (type === "loading" ? Infinity : 5000)

        setToasts((prev) => [...prev, { id, message, title: options?.title, type, duration }])

        if (duration !== Infinity) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <Toaster toasts={toasts} dismiss={dismiss} />
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }
    return context
}

function Toaster({ toasts, dismiss }: { toasts: Toast[], dismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-0 right-0 p-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-md">
            <AnimatePresence mode="popLayout">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        className="pointer-events-auto"
                    >
                        <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

function ToastItem({ toast, onDismiss }: { toast: Toast, onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertCircle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        loading: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }

    const bgs = {
        success: "bg-emerald-50 border-emerald-100",
        error: "bg-rose-50 border-rose-100",
        info: "bg-blue-50 border-blue-100",
        warning: "bg-amber-50 border-amber-100",
        loading: "bg-slate-50 border-slate-100"
    }

    return (
        <div className={cn(
            "flex items-start gap-4 p-4 rounded-3xl border-2 shadow-2xl backdrop-blur-md bg-white/90",
            bgs[toast.type]
        )}>
            <div className="mt-0.5 shrink-0">
                {icons[toast.type]}
            </div>
            <div className="flex-1 space-y-1">
                {toast.title && <h4 className="font-black text-slate-900 leading-none tracking-tight">{toast.title}</h4>}
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{toast.message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
                <X className="h-4 w-4 text-slate-400" />
            </button>
        </div>
    )
}
