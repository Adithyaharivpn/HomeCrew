"use client";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true
}) => {
    const [openState, setOpenState] = useState(false);
    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...(props)} />
        </>
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-4 py-4 hidden md:flex md:flex-col bg-card dark:bg-card w-[300px] flex-shrink-0 border-r border-border",
                className
            )}
            animate={{
                width: animate ? (open ? "300px" : "60px") : "300px",
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    ...props
}) => {
    const { open, setOpen } = useSidebar();
    return (
        <div
            className={cn(
                "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-card dark:bg-card w-full border-b border-border"
            )}
            {...props}
        >
            <div className="flex justify-end z-20 w-full">
                <Menu
                    className="text-foreground"
                    onClick={() => setOpen(!open)}
                />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        className={cn(
                            "fixed h-full w-full inset-0 bg-background p-10 z-[100] flex flex-col justify-between",
                            className
                        )}
                    >
                        <div
                            className="absolute right-10 top-10 z-50 text-foreground"
                            onClick={() => setOpen(!open)}
                        >
                            <X />
                        </div>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}) => {
    const { open, animate } = useSidebar();
    const content = (
        <div 
            className={cn(
                "flex items-center justify-start gap-2 group/sidebar py-2 w-full",
                className
            )}
            {...props}
        >
            {link.icon}

            <motion.span
                animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                className="text-foreground text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 flex-1"
            >
                {link.label}
            </motion.span>
            
            {link.badge > 0 && (
                <motion.span
                    initial={false}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: animate ? (open ? 0 : 0) : 0,
                        y: animate ? (open ? 0 : 0) : 0,
                    }}
                    className={cn(
                        "bg-blue-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shrink-0 z-10",
                        !open && "absolute top-1 right-1 h-4 w-4 text-[8px]"
                    )}
                >
                    {link.badge}
                </motion.span>
            )}
        </div>
    );

    if (link.onClick) {
        return <div onClick={link.onClick} className="cursor-pointer">{content}</div>;
    }

    if (!link.href) {
        return content;
    }

    return (
        <Link
            to={link.href}
        >
            {content}
        </Link>
    );
};
