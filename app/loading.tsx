// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-b-blue-500 border-l-blue-600 border-t-blue-500"></div>
      <span className="font-inter text-lg text-gray-500 dark:text-gray-300"></span>
    </div>
  );
}
