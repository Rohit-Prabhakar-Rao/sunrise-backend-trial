import { useAuth } from "react-oidc-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ children, requiredRoles = [] }: ProtectedRouteProps) => {
  const auth = useAuth();

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading permissions...
      </div>
    );
  }

  // 1. Get Realm Roles (Global)
  const realmRoles = (auth.user.profile as any).realm_access?.roles || [];

  // 2. Get Client Roles (Specific to 'sunrise-app')
  const clientRoles = (auth.user.profile as any).resource_access?.['sunrise-app']?.roles || [];

  // 3. Combine them
  const allUserRoles = [...realmRoles, ...clientRoles];

  // 4. Check if we match
  const hasPermission = requiredRoles.some(role => allUserRoles.includes(role));

  if (!hasPermission) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">

        {/* --- BACKGROUND SECTION --- */}
        <div className="absolute inset-0 z-0">
          <img
            src="images/sunrise_bg.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay to ensure the white card pops out */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        {/* --- ACCESS DENIED CARD --- */}
        <div className="relative z-10 w-full max-w-md p-8 bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl text-center animate-in zoom-in duration-300">

          {/* LOGO */}
          <div className="flex justify-center mb-4">
            <img
              src="images/sunrise_logo.png"
              alt="Sunrise Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>

          <p className="text-gray-600 mb-6 text-sm">
            You are logged in as <strong>{auth.user.profile.preferred_username}</strong>,
            but your account does not have the required permissions to view this page.
          </p>

          {/* Technical Details Box */}
          <div className="text-left bg-gray-100/80 border border-gray-200 p-4 rounded-lg text-sm mb-6 shadow-inner">
            <div className="mb-2">
              <p className="font-bold text-gray-700 text-xs uppercase">Missing Permission:</p>
              <p className="text-red-600 font-mono text-xs mt-0.5">{requiredRoles.join(", ")}</p>
            </div>
            <hr className="border-gray-300 my-2" />
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase">Your Current Roles:</p>
              <p className="text-blue-600 font-mono text-xs break-words mt-0.5 leading-relaxed">
                {allUserRoles.join(", ") || "None found"}
              </p>
            </div>
          </div>

          <button
            onClick={() => auth.signoutRedirect()}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Log Out & Switch Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};