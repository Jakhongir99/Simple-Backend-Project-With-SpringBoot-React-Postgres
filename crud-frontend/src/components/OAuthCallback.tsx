import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const success = searchParams.get("success");

    if (success === "true" && token) {
      // Store the JWT token
      localStorage.setItem("token", token);
      if (email) {
        localStorage.setItem("userEmail", email);
      }

      console.log("🔐 OAuth2 Callback: Token stored in localStorage", {
        hasToken: !!token,
        tokenLength: token?.length,
        email: email,
      });

      // Use the login function from useAuth to properly set authentication state
      try {
        login(token);

        console.log(
          "🔐 OAuth2 Callback: Login function called, redirecting to dashboard"
        );

        // Immediately redirect to dashboard - no delay, no UI shown
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("❌ OAuth2 Callback: Error during login", error);
        // If there's an error, redirect to auth page
        navigate("/auth", { replace: true });
      }
    } else {
      console.log("❌ OAuth2 Callback: Authentication failed", {
        success,
        hasToken: !!token,
      });
      // If authentication failed, redirect to auth page
      navigate("/auth", { replace: true });
    }
  }, [searchParams, navigate, login]);

  // Return null - no UI will be shown
  return null;
};

export default OAuthCallback;
