import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link href="/" className="text-sm underline">
        Go home
      </Link>
    </main>
  );
}
