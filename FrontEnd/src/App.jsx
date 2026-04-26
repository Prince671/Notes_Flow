import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Notes from "./components/Notes";
import Login from "./components/Login";
import Register from "./components/Register";

// Lazy imports
// const Notes = lazy(() => import("./components/Notes"));
// const Login = lazy(() => import("./components/Login"));
// const Register = lazy(() => import("./components/Register"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));
const SharedNote = lazy(() => import("./components/SharedNote"));
const NotFound = lazy(() => import("./components/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PublicRoute = lazy(() => import("./components/PublicRoute"));

// ─── Reusable skeleton block ───────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-md ${className}`}
    />
  );
}

// ─── LOGIN skeleton ────────────────────────────────────────────────────────
function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <SkeletonBlock className="w-14 h-14 rounded-full" />
          <SkeletonBlock className="w-32 h-7 rounded-lg" />
          <SkeletonBlock className="w-48 h-4 rounded" />
        </div>
        {/* Email field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-16 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Password field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-20 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Forgot password */}
        <SkeletonBlock className="w-32 h-4 rounded self-end" />
        {/* Login button */}
        <SkeletonBlock className="w-full h-11 rounded-lg" />
        {/* Register link */}
        <SkeletonBlock className="w-48 h-4 rounded self-center" />
      </div>
    </div>
  );
}

// ─── REGISTER skeleton ─────────────────────────────────────────────────────
function RegisterSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col gap-6">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <SkeletonBlock className="w-14 h-14 rounded-full" />
          <SkeletonBlock className="w-40 h-7 rounded-lg" />
          <SkeletonBlock className="w-52 h-4 rounded" />
        </div>
        {/* Name field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-20 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Email field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-16 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Password field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-20 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Confirm password field */}
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-36 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        {/* Register button */}
        <SkeletonBlock className="w-full h-11 rounded-lg" />
        {/* Login link */}
        <SkeletonBlock className="w-44 h-4 rounded self-center" />
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD skeleton ──────────────────────────────────────────────
function ForgotPasswordSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 mb-2">
          <SkeletonBlock className="w-14 h-14 rounded-full" />
          <SkeletonBlock className="w-44 h-7 rounded-lg" />
          <SkeletonBlock className="w-64 h-4 rounded" />
          <SkeletonBlock className="w-56 h-4 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-16 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        <SkeletonBlock className="w-full h-11 rounded-lg" />
        <SkeletonBlock className="w-36 h-4 rounded self-center" />
      </div>
    </div>
  );
}

// ─── RESET PASSWORD skeleton ───────────────────────────────────────────────
function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 mb-2">
          <SkeletonBlock className="w-14 h-14 rounded-full" />
          <SkeletonBlock className="w-40 h-7 rounded-lg" />
          <SkeletonBlock className="w-56 h-4 rounded" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-28 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="w-36 h-4 rounded" />
          <SkeletonBlock className="w-full h-11 rounded-lg" />
        </div>
        <SkeletonBlock className="w-full h-11 rounded-lg" />
      </div>
    </div>
  );
}

// ─── NOTES skeleton ────────────────────────────────────────────────────────
function NotesSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Navbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <SkeletonBlock className="w-28 h-8 rounded-lg" />
        <div className="flex gap-3">
          <SkeletonBlock className="w-8 h-8 rounded-full" />
          <SkeletonBlock className="w-20 h-8 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="hidden sm:flex flex-col gap-4 w-56 shrink-0 bg-slate-800 border-r border-slate-700 px-4 py-6">
          <SkeletonBlock className="w-full h-10 rounded-lg" />
          <SkeletonBlock className="w-24 h-4 mt-2" />
          {[...Array(5)].map((_, i) => (
            <SkeletonBlock key={i} className="w-full h-9 rounded-lg" />
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 sm:p-8">
          {/* Search + Add bar */}
          <div className="flex gap-3 mb-8">
            <SkeletonBlock className="flex-1 h-10 rounded-lg" />
            <SkeletonBlock className="w-28 h-10 rounded-lg" />
          </div>

          {/* Section title */}
          <SkeletonBlock className="w-36 h-6 mb-6 rounded-lg" />

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3"
              >
                <SkeletonBlock className="w-3/4 h-5" />
                <SkeletonBlock className="w-full h-3" />
                <SkeletonBlock className="w-2/3 h-3" />
                <SkeletonBlock className="w-full h-3" />
                <div className="flex justify-between items-center mt-2">
                  <SkeletonBlock className="w-16 h-5 rounded-full" />
                  <div className="flex gap-2">
                    <SkeletonBlock className="w-8 h-8 rounded-lg" />
                    <SkeletonBlock className="w-8 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED NOTE skeleton ──────────────────────────────────────────────────
function SharedNoteSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <SkeletonBlock className="w-28 h-8 rounded-lg" />
        <SkeletonBlock className="w-24 h-8 rounded-lg" />
      </div>
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-6">
        <SkeletonBlock className="w-3/4 h-9 rounded-lg" />
        <div className="flex gap-4">
          <SkeletonBlock className="w-24 h-5 rounded-full" />
          <SkeletonBlock className="w-32 h-5 rounded" />
        </div>
        <div className="flex flex-col gap-3 mt-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonBlock
              key={i}
              className={`h-4 rounded ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Route-aware skeleton picker ───────────────────────────────────────────
function SmartSkeleton() {
  const { pathname } = useLocation();
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDone(false); // reset on every route change
    const timer = setTimeout(() => setDone(true), 5000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (done) return null;

  if (pathname === "/" || pathname === "/login") return <LoginSkeleton />;
  if (pathname === "/register") return <RegisterSkeleton />;
  if (pathname === "/forgot-password") return <ForgotPasswordSkeleton />;
  if (pathname === "/reset-password") return <ResetPasswordSkeleton />;
  if (pathname.startsWith("/notes/shared")) return <SharedNoteSkeleton />;
  if (pathname.startsWith("/notes")) return <NotesSkeleton />;

  // fallback for 404 or unknown
  return <NotesSkeleton />;
}

// ─── App ───────────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <Suspense fallback={<SmartSkeleton />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/shared/:publicId"
            element={
              <ProtectedRoute>
                <SharedNote />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
