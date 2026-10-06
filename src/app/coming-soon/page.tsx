"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    hours: "72",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // 72 hours from load
    const countDownDate = new Date().getTime() + 72 * 60 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      });

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "#111111",
        color: "#ffffff",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(17,17,17,0) 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 0,
        }}
        className="bg-glow-anim"
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulseGlow {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          }
          .bg-glow-anim {
            animation: pulseGlow 4s infinite alternate;
          }
          @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
          }
          .fade-in-up {
            animation: fadeInUp 1.5s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
          }
          .time-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(212,175,55,0.2);
            padding: 1.5rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            min-width: 90px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          @media (max-width: 600px) {
            .title-text { font-size: 2.5rem !important; }
            .timer-container { gap: 1rem !important; flex-wrap: wrap; }
            .time-box { min-width: 70px; padding: 1rem; }
            .number-text { font-size: 2rem !important; }
          }
        `
      }} />

      <div
        className="fade-in-up"
        style={{
          zIndex: 1,
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <Image
          src="/logo-new.png"
          alt="TheNiceLamps Logo"
          width={120}
          height={120}
          style={{
            marginBottom: "1.5rem",
            filter: "drop-shadow(0 0 10px rgba(212,175,55,0.3))",
          }}
        />

        <h1
          className="title-text"
          style={{
            fontSize: "3.5rem",
            fontWeight: 600,
            margin: 0,
            background: "linear-gradient(to right, #e8d08c, #d4af37, #e8d08c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "4px",
          }}
        >
          TheNiceLamps
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#aaaaaa",
            marginTop: "1rem",
            marginBottom: "3rem",
            fontWeight: 300,
            letterSpacing: "1px",
          }}
        >
          Brilliance in Every Corner. Our grand opening is almost here.
        </p>

        <div
          className="timer-container"
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            marginBottom: "3rem",
          }}
        >
          <div className="time-box">
            <div
              className="number-text"
              style={{
                fontSize: "3rem",
                color: "#d4af37",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}
            >
              {timeLeft.hours}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#888888",
              }}
            >
              Hours
            </div>
          </div>
          <div className="time-box">
            <div
              className="number-text"
              style={{
                fontSize: "3rem",
                color: "#d4af37",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}
            >
              {timeLeft.minutes}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#888888",
              }}
            >
              Minutes
            </div>
          </div>
          <div className="time-box">
            <div
              className="number-text"
              style={{
                fontSize: "3rem",
                color: "#d4af37",
                fontWeight: 600,
                lineHeight: 1,
                marginBottom: "0.5rem",
              }}
            >
              {timeLeft.seconds}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "2px",
                color: "#888888",
              }}
            >
              Seconds
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "2rem",
          color: "#666666",
          fontSize: "0.9rem",
          zIndex: 1,
        }}
      >
        Questions? Contact us at{" "}
        <a href="mailto:contact@thenicelamps.com" style={{ color: "#d4af37", textDecoration: "none" }}>
          contact@thenicelamps.com
        </a>
      </div>
    </div>
  );
}
