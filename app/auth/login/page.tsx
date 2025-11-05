"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Load remember me preference on mount and check for error in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
      setRememberMe(savedRememberMe);
      
      // Check for error in URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      if (urlError) {
        if (urlError === 'auth_callback_error') {
          setError('Authentication failed. Please try again.');
        } else {
          setError('An error occurred during authentication.');
        }
        // Clean up URL
        router.replace('/auth/login');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await authService.signIn(email, password, rememberMe);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push("/workspace");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
      // Note: User will be redirected to Google, so we don't need to handle success here
    } catch (err) {
      setError("An unexpected error occurred");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-[#0b1220] to-[#0f1a3a]">
      <div className="w-full max-w-6xl rounded-[32px] bg-white p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Header + Form */}
          <div className="p-6 md:p-10">
            <div className="mb-6 text-left">
              <Link href="/" className="inline-block">
                <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                  YETTI<span className="text-gray-400">.AI</span>
                </span>
              </Link>
              <h2 className="mt-4 text-3xl font-bold text-gray-900">Welcome home</h2>
              <p className="mt-1 text-sm text-gray-600">Please enter your details.</p>
            </div>

            <div className="rounded-2xl p-0">
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
        
        
        
        
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 bg-white text-[#5170ff] focus:ring-[#5170ff]" 
                />
                Remember me
              </label>
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="text-[#5170ff] hover:text-[#405ce6] font-medium">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5170ff] hover:bg-[#4a68f0] text-white py-3 px-4 rounded-xl font-semibold transition-colors shadow-[0_8px_30px_rgba(81,112,255,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link href="/auth/signup" className="text-[#5170ff] hover:text-[#405ce6] font-medium">
                  Sign up
                </Link>
              </span>
            </div>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button 
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-gray-800">{googleLoading ? "Signing in..." : "Google"}</span>
              </button>
            </div>
          </div>
          </div>
          </div>
          {/* Right: Visual */}
          <div className="p-4 md:p-6">
            <div className="h-full w-full rounded-[28px] bg-white p-2">
              <div className="relative h-full rounded-2xl overflow-hidden bg-[radial-gradient(1200px_600px_at_60%_-20%,#6e7bff_0%,#0b1220_60%)]">
                <Image src="/yetti/yetti_laptop.png" alt="Yetti with laptop" fill className="object-contain p-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
