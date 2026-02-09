import { Loader2 } from "lucide-react";

export const ContentLoader = ({ message = "Refreshing..." }: { message?: string }) => {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] animate-in fade-in duration-300">
            <div className="bg-card p-4 rounded-xl shadow-lg border border-border/40 flex flex-col items-center gap-3 transition-all animate-in zoom-in-95 duration-300">
                <div className="relative h-10 w-10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    <Loader2 className="h-4 w-4 animate-pulse text-primary" />
                </div>
                <p className="text-[11px] font-bold tracking-tight text-foreground uppercase animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};
