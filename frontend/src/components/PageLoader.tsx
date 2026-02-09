import { Loader2 } from "lucide-react";

export const PageLoader = ({ message = "Loading content..." }: { message?: string }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
                {/* Animated outer ring */}
                <div className="absolute h-24 w-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />

                {/* Pulsing logo area */}
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-lg ring-1 ring-border animate-pulse">
                    <img
                        src="/images/sunrise_logo.png"
                        alt="Logo"
                        className="h-10 w-auto object-contain"
                        onError={(e) => {
                            // Fallback if logo fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-primary');
                        }}
                    />
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <p className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {message}
                </p>
                <p className="text-xs text-muted-foreground animate-pulse">
                    Connecting to Enterprise System
                </p>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -top-[10%] -left-[10%] w-[40vh] h-[40vh] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40vh] h-[40vh] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />
        </div>
    );
};
