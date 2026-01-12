export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-8 p-8">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          Dividend Portfolio Projector
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Upload your portfolio to project dividend income
        </p>
        <div className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600">
          Tailwind CSS is working!
        </div>
      </main>
    </div>
  );
}
