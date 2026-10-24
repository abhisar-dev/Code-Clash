'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { AdminPanel } from '@/components/AdminPanel';
import { User, saveUserSession, getCurrentUser } from '@/lib/auth';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter Admin Email or Username.');
      return;
    }
    if (!password) {
      setError('Please enter Admin Master Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signin',
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        const fullAdmin: User = {
          ...data.user,
          role: 'admin',
          isAdmin: true,
        };
        // Keep in component state for this active session only so opening /admin afresh asks for login
        setAdminUser(fullAdmin);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      setError(data.error || 'Invalid Administrative Credentials. Access Denied.');
    } catch {
      // Local fallback for admin
      const cleanIdent = identifier.trim().toLowerCase();
      if (
        (cleanIdent === 'admin' || cleanIdent === 'admin@invertis.ac.in' || cleanIdent === 'superadmin') &&
        (password === 'admin123' || password === 'invertisadmin')
      ) {
        const fallbackAdmin: User = {
          id: 'user-invertis-admin',
          name: 'Campus SuperAdmin',
          email: 'admin@invertis.ac.in',
          handle: 'admin',
          college: 'Invertis University Administration',
          elo: 2400,
          matchesWon: 0,
          matchesPlayed: 0,
          joinedAt: '2026-08-01T00:00:00.000Z',
          role: 'admin',
          isAdmin: true,
        };
        setAdminUser(fallbackAdmin);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      setError('Connection failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutAdmin = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  // If authenticated as admin, show full dedicated Admin Panel
  if (isAuthenticated && adminUser) {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-950">
        <AdminPanel
          currentUser={adminUser}
          onClose={handleSignOutAdmin}
        />
      </div>
    );
  }

  // Pinparker Space Cosmic Theme Admin Form
  return (
    <div className="space-wrapper">
      <style jsx global>{`
        .space-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020014;
          position: relative;
          overflow: hidden;
          font-family: monospace;
          padding: 1.5rem;
        }

        .back-nav {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          z-index: 20;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(2, 0, 36, 0.7);
          color: #fff;
          font-size: 0.75rem;
          font-family: monospace;
          text-decoration: none;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          border-color: #00d4ff;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
          color: #00d4ff;
        }

        /* From Uiverse.io by Pinparker */
        .space-form {
          position: relative;
          display: block;
          padding: 2.2rem;
          width: 100%;
          max-width: 380px;
          background: linear-gradient(
              14deg,
              rgba(2, 0, 36, 0.85) 0%,
              rgba(24, 24, 65, 0.75) 66%,
              rgb(20, 76, 99) 100%
            ),
            radial-gradient(
              circle,
              rgba(2, 0, 36, 0.6) 0%,
              rgba(32, 15, 53, 0.3) 65%,
              rgba(14, 29, 28, 0.95) 100%
            );
          border: 2px solid #ffffff;
          -webkit-box-shadow: rgba(0, 212, 255, 0.6) 0px 0px 50px -10px;
          box-shadow: rgba(0, 212, 255, 0.6) 0px 0px 50px -10px;
          overflow: hidden;
          z-index: 1;
          border-radius: 12px;
          box-sizing: border-box;
        }

        /* Header section */
        .form-title {
          font-size: 1.15rem;
          line-height: 1.75rem;
          font-family: monospace;
          font-weight: 600;
          text-align: center;
          color: #fff;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          letter-spacing: 0.05rem;
        }

        .form-title span {
          animation: flickering 2s linear infinite both;
        }

        .title-2 {
          display: block;
          margin-top: -0.25rem;
          margin-bottom: 1.25rem;
          font-size: 2.1rem;
          font-weight: 800;
          font-family: Arial, Helvetica, sans-serif;
          text-align: center;
          -webkit-text-stroke: #fff 0.1rem;
          letter-spacing: 0.25rem;
          color: transparent;
          position: relative;
          text-shadow: 0px 0px 16px #cecece;
        }

        .title-2 span::before,
        .title-2 span::after {
          content: "-";
        }

        @keyframes flickering {
          0%, 100% { opacity: 1; }
          41.99% { opacity: 1; }
          42% { opacity: 0; }
          43% { opacity: 0; }
          43.01% { opacity: 1; }
          47.99% { opacity: 1; }
          48% { opacity: 0; }
          49% { opacity: 0; }
          49.01% { opacity: 1; }
        }

        /* Shooting stars */
        .bg-stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -2;
          background-size: cover;
          animation: animateBg 50s linear infinite;
          pointer-events: none;
        }

        @keyframes animateBg {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .star {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1),
            0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1);
          animation: animate 3s linear infinite;
        }

        .star::before {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          height: 1px;
          background: linear-gradient(90deg, #fff, transparent);
        }

        @keyframes animate {
          0% {
            transform: rotate(315deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(315deg) translateX(-1000px);
            opacity: 0;
          }
        }

        .star:nth-child(1) {
          top: 0;
          right: 0;
          left: initial;
          animation-delay: 0s;
          animation-duration: 1.2s;
        }

        .star:nth-child(2) {
          top: 0;
          right: 100px;
          left: initial;
          animation-delay: 0.3s;
          animation-duration: 3s;
        }

        .star:nth-child(3) {
          top: 0;
          right: 220px;
          left: initial;
          animation-delay: 2.75s;
          animation-duration: 2.75s;
        }

        .star:nth-child(4) {
          top: 0;
          right: -180px;
          left: initial;
          animation-delay: 1.6s;
          animation-duration: 1.8s;
        }

        /* Input and submit section */
        .input-container {
          position: relative;
          margin-bottom: 0.85rem;
        }

        .input-container input,
        .space-form .submit {
          outline: none;
          border: 2px solid #ffffff;
          margin: 6px 0;
          font-family: monospace;
          border-radius: 6px;
          box-sizing: border-box;
        }

        .input-container input {
          background-color: #ffffff;
          color: #050510;
          padding: 9px 12px;
          font-size: 0.875rem;
          line-height: 1.25rem;
          width: 100%;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-container input:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        .input-mail:focus::placeholder {
          opacity: 0;
          transition: opacity 0.5s;
        }

        .input-pwd:focus::placeholder {
          opacity: 0;
          transition: opacity 0.5s;
        }

        .submit {
          position: relative;
          display: block;
          padding: 10px;
          background: linear-gradient(90deg, #243949 0%, #517fa4 100%);
          color: #ffffff;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
          font-size: 0.875rem;
          line-height: 1.25rem;
          font-weight: 700;
          width: 100%;
          text-transform: uppercase;
          overflow: hidden;
          letter-spacing: 0.1rem;
          cursor: pointer;
          margin-top: 1rem !important;
          transition: all 0.2s ease-out;
        }

        .submit:hover {
          transition: all 0.2s ease-out;
          box-shadow: 0 0 20px #00d4ff, 0 0 10px #ffffff;
          border-color: #00d4ff;
        }

        .submit:hover::before {
          animation: sh02 0.5s 0s linear;
        }

        .submit::before {
          content: "";
          display: block;
          width: 0px;
          height: 85%;
          position: absolute;
          top: 50%;
          left: 0%;
          opacity: 0;
          background: #fff;
          box-shadow: 0 0 50px 30px #fff;
          transform: skewX(-20deg);
        }

        @keyframes sh02 {
          from {
            opacity: 0;
            left: 0%;
          }
          50% {
            opacity: 1;
          }
          to {
            opacity: 0;
            left: 100%;
          }
        }

        .space-alert {
          padding: 0.6rem 0.75rem;
          border-radius: 6px;
          background: rgba(244, 63, 94, 0.2);
          border: 1px solid rgba(244, 63, 94, 0.6);
          color: #fecdd3;
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: monospace;
        }

        .signup-link {
          color: #c0c0c0;
          font-size: 0.75rem;
          line-height: 1.25rem;
          text-align: center;
          font-family: monospace;
          margin-top: 1.25rem;
          margin-bottom: 0;
        }

        .signup-link a {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 700;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Back to student platform */}
      <div className="back-nav">
        <Link href="/" className="back-btn">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Space to CodeClash</span>
        </Link>
      </div>

      {/* From Uiverse.io by Pinparker */}
      <form className="space-form" onSubmit={handleAdminLogin}>
        <div className="form-title">
          <span>sign in to your</span>
        </div>
        <div className="title-2">
          <span>SPACE</span>
        </div>

        {error && (
          <div className="space-alert">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="input-container">
          <input
            placeholder="Admin Email / Identifier"
            type="text"
            autoComplete="off"
            className="input-mail"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        {/* Shooting Stars Cosmic Section */}
        <section className="bg-stars">
          <span className="star"></span>
          <span className="star"></span>
          <span className="star"></span>
          <span className="star"></span>
        </section>

        <div className="input-container">
          <input
            placeholder="Master Password"
            type="text"
            autoComplete="off"
            spellCheck={false}
            className="input-pwd"
            style={password ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties) : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="submit" type="submit" disabled={loading}>
          <span className="sign-text">
            {loading ? 'Authenticating...' : 'Sign in'}
          </span>
        </button>

        <p className="signup-link">
          Invertis Control Hub?{' '}
          <Link href="/" className="up">
            Student Arena!
          </Link>
        </p>
      </form>
    </div>
  );
}
