"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConfirmOptions {
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "default" | "destructive"
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<ConfirmOptions | null>(null)
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setConfig(options)
            setResolveRef(() => resolve)
        })
    }, [])

    const handleClose = (value: boolean) => {
        if (resolveRef) resolveRef(value)
        setConfig(null)
        setResolveRef(null)
    }

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100"
                        >
                            <div className="p-8 md:p-10 space-y-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className={cn(
                                        "p-4 rounded-3xl",
                                        config.variant === "destructive" ? "bg-red-50 text-red-500" : "bg-teal-50 text-teal-700"
                                    )}>
                                        <AlertCircle className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-stone-900 tracking-tight">{config.title}</h3>
                                        <p className="text-stone-500 font-medium leading-relaxed">
                                            {config.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <Button
                                        size="lg"
                                        className={cn(
                                            "h-14 rounded-2xl font-black text-lg shadow-xl",
                                            config.variant === "destructive"
                                                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                                : "bg-teal-800 hover:bg-teal-800 shadow-teal-700/20"
                                        )}
                                        onClick={() => handleClose(true)}
                                    >
                                        {config.confirmLabel || "Confirmar"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="h-14 rounded-2xl font-bold text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                                        onClick={() => handleClose(false)}
                                    >
                                        {config.cancelLabel || "Cancelar"}
                                    </Button>
                                </div>
                            </div>

                            <button
                                onClick={() => handleClose(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-50 text-stone-400 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    )
}

export function useConfirm() {
    const context = useContext(ConfirmContext)
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmProvider")
    }
    return context
}
