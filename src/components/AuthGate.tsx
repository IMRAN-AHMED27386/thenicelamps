"use client";

import { useState } from "react";
import {
  resetPassword,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  sendOtp,
  setupRecaptcha,
} from "@/lib/customer";
import { showToast } from "@/lib/toast";

export default function AuthGate() {
  const [step, setStep] = useState<"input" | "password" | "otp" | "signup">("input");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const handleContinue = async () => {
    const val = identifier.trim();
    if (!val) return showToast("Please enter email or mobile number", false);
    
    const isMobile = /^[6-9]\d{9}$/.test(val);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    if (!isMobile && !isEmail) {
      return showToast("Please enter a valid email or 10-digit mobile number", false);
    }

    if (isEmail) {
      setStep("password");
    } else if (isMobile) {
      setBusy(true);
      try {
        const verifier = setupRecaptcha();
        const result = await sendOtp("+91" + val, verifier);
        setConfirmationResult(result);
        setStep("otp");
        showToast("OTP sent to your mobile number");
      } catch (e: any) {
        console.error("OTP Error:", e);
        showToast(e.message || "Failed to send OTP. Please try again.", false);
      } finally {
        setBusy(false);
      }
    }
  };

  const handleEmailLogin = async () => {
    if (password.length < 6)
      return showToast("Password must be at least 6 characters", false);
    setBusy(true);
    try {
      await signInWithEmail(identifier.trim(), password);
      showToast("Welcome back 💖");
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        showToast("Incorrect password", false);
      } else if (code === "auth/user-not-found") {
        setStep("signup");
        showToast("Account not found. Please create one.");
      } else {
        showToast("Something went wrong — please try again", false);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignup = async () => {
    if (name.trim().length < 2)
      return showToast("Please enter your name", false);
    setBusy(true);
    try {
      await signUpWithEmail(name, identifier.trim(), password);
      showToast("Account created — welcome to TheNiceLamps 💖");
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/email-already-in-use")
        showToast("An account already exists — try signing in", false);
      else showToast("Something went wrong during signup", false);
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return showToast("Enter a valid 6-digit OTP", false);
    setBusy(true);
    try {
      await confirmationResult.confirm(otp);
      showToast("Welcome 💖");
    } catch (e) {
      showToast("Invalid or expired OTP", false);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
      showToast("Welcome 💖");
    } catch {
      showToast("Google sign-in failed", false);
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    try {
      await resetPassword(identifier.trim());
      showToast("Password reset email sent to " + identifier.trim());
    } catch {
      showToast("Could not send reset email", false);
    }
  };

  return (
    <div className="admin-card admin-narrow">
      <p className="s-eyebrow">TheNiceLamps</p>
      <h1 className="admin-title">
        {step === "signup" ? "Create Account" : "Sign In"}
      </h1>
      <p className="auth-sub">
        {step === "signup"
          ? "Create your account to get started."
          : "Welcome back! Please sign in to continue."}
      </p>

      <button className="social-btn social-google" onClick={google} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="social-divider"><span>or</span></div>

      {step === "input" && (
        <>
          <label className="admin-label">Email or Mobile Number</label>
          <div className="admin-input-wrap">
            <svg
              className="admin-input-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              className="admin-input admin-input-has-icon"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or mobile number"
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
          </div>
          <p className="admin-input-hint">We&rsquo;ll send you a code to sign in.</p>
          <button id="continue-btn" className="btn-rose admin-btn" onClick={handleContinue} disabled={busy}>
            <span className="btn-ico">✦</span> {busy ? "Please wait…" : "Continue"}
          </button>
        </>
      )}

      {step === "password" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p className="admin-label" style={{ marginBottom: 4 }}>Email</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="order-line" style={{ margin: 0 }}>{identifier}</p>
              <button className="admin-linkbtn" onClick={() => setStep("input")}>Change</button>
            </div>
          </div>
          
          <label className="admin-label">Password</label>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
          />
          <button className="btn-rose admin-btn" onClick={handleEmailLogin} disabled={busy}>
            <span className="btn-ico">✦</span> {busy ? "Please wait…" : "Sign In"}
          </button>

          <button className="admin-linkbtn" style={{ marginTop: 16 }} onClick={forgot}>
            Forgot password?
          </button>
          
          <p className="social-switch">
            New here?{" "}
            <button className="social-switch-btn" onClick={() => setStep("signup")}>
              Create an account
            </button>
          </p>
        </>
      )}

      {step === "otp" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p className="admin-label" style={{ marginBottom: 4 }}>Mobile Number</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="order-line" style={{ margin: 0 }}>+91 {identifier}</p>
              <button className="admin-linkbtn" onClick={() => setStep("input")}>Change</button>
            </div>
          </div>

          <label className="admin-label">6-Digit OTP</label>
          <input
            className="admin-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="XXXXXX"
            onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
          />
          <button className="btn-rose admin-btn" onClick={handleVerifyOtp} disabled={busy}>
            <span className="btn-ico">✦</span> {busy ? "Verifying…" : "Verify & Sign In"}
          </button>
        </>
      )}

      {step === "signup" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <p className="admin-label" style={{ marginBottom: 4 }}>Email</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="order-line" style={{ margin: 0 }}>{identifier}</p>
              <button className="admin-linkbtn" onClick={() => setStep("input")}>Change</button>
            </div>
          </div>
          
          <label className="admin-label">Full name</label>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="admin-label">Password</label>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
          />

          <button className="btn-rose admin-btn" onClick={handleSignup} disabled={busy}>
            <span className="btn-ico">✦</span> {busy ? "Please wait…" : "Create Account"}
          </button>

          <p className="social-switch">
            Already have an account?{" "}
            <button className="social-switch-btn" onClick={() => setStep("password")}>
              Sign in
            </button>
          </p>
        </>
      )}
    </div>
  );
}
