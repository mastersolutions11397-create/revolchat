import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-dashboard-bg px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl sm:text-8xl font-bold text-teal-primary/20">404</h1>
        <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-slate-900">
          Page not found
        </h2>
        <p className="mt-2 text-slate-600 text-sm sm:text-base">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-teal-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-accent"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
