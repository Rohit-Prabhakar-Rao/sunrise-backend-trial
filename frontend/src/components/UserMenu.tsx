import { useAuth } from "react-oidc-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Shield } from "lucide-react";

export function UserMenu() {
  const auth = useAuth();

  // If not logged in, don't show anything (or show a Login button)
  if (!auth.isAuthenticated || !auth.user) return null;

  // Get User Details from Token
  const username = auth.user.profile.preferred_username || "User";
  const email = auth.user.profile.email || "";
  
  // Extract Initials (e.g. "Sales Rep" -> "SR")
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Optional: Show Roles for debugging */}
        <DropdownMenuItem className="cursor-default">
           <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
           <span className="text-xs text-muted-foreground">
             Role: {(auth.user.profile as any).realm_access?.roles?.[0] || "User"}
           </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* LOGOUT BUTTON */}
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={() => {
              // Prepare the logout parameters
              const logoutParams = {
                  // This is the ADFS logout page
                  // post_logout_redirect_uri: "https://adfs.sunrise.lab/adfs/ls/?wa=wsignout1.0",
                  post_logout_redirect_uri: import.meta.env.VITE_ADFS_LOGOUT_REDIRECT_URI,
                  // This 'hint' tells Keycloak exactly which session to kill so it doesn't ask "Are you sure?"
                  id_token_hint: auth.user?.id_token, 
              };

              // Clear local storage manually to be safe
              localStorage.clear();
              sessionStorage.clear();

              // Perform the redirect using the library's built-in method
              auth.signoutRedirect(logoutParams);
          }}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}