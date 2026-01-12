import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

interface UnlockScreenProps {
  onUnlock: (key: string) => Promise<void>;
}

export function UnlockScreen({ onUnlock }: UnlockScreenProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate key format
    const keyPattern = /^[A-Za-z0-9]{16}$/;
    if (!keyPattern.test(key)) {
      setError("Key must be exactly 16 alphanumeric characters");
      return;
    }

    setLoading(true);
    try {
      await onUnlock(key);
    } catch (err: any) {
      setError(err.message || "Failed to unlock. Please check your key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 16);
    setKey(value);
    setError("");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Access Required</CardTitle>
          <CardDescription>
            Enter your 16-character unlock key to access the inventory system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlock-key">Unlock Key</Label>
              <Input
                id="unlock-key"
                type="text"
                value={key}
                onChange={handleKeyChange}
                placeholder="Enter 16-character key"
                maxLength={16}
                className="font-mono text-center text-lg tracking-widest"
                disabled={loading}
                autoFocus
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                {key.length}/16 characters
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || key.length !== 16}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


