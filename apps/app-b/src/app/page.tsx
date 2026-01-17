"use client";

import MfeComponent from "../mfe-component";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">App B Standalone Mode</h1>
        <MfeComponent />
      </div>
    </main>
  );
}
