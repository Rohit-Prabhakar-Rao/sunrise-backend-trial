import { AuthProviderProps } from "react-oidc-context";

export const oidcConfig: AuthProviderProps = {
  // authority: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm",
  authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
  // client_id: "sunrise-app",
  client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  post_logout_redirect_uri: window.location.origin,

  // --- THE FIX --- (dev phase)
  // We provide the metadata manually so the library doesn't try to fetch it via ngrok.
  // This completely avoids the 'text/html' content-type error.
  metadata: {
    issuer: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm",
    authorization_endpoint: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm/protocol/openid-connect/auth",
    token_endpoint: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm/protocol/openid-connect/token",
    jwks_uri: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm/protocol/openid-connect/certs",
    userinfo_endpoint: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm/protocol/openid-connect/userinfo",
    end_session_endpoint: "https://substructional-kalel-unchampioned.ngrok-free.dev/realms/sunrise-realm/protocol/openid-connect/logout",
  },

  onSigninCallback: () => {
      window.history.replaceState({}, document.title, window.location.pathname);
  }
};