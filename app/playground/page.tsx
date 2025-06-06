'use client';
import Playground from '../../components/Playground';

export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold">Prompt Playground</h1>
      <Playground />
    </div>
  );
}
