// app/loading.tsx
export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        <div className="animate-spin h-14 w-14 border-4 border-purple-600 border-t-pink-500 border-b-pink-500 border-l-purple-600 rounded-full mb-6"></div>
        <span className="text-lg font-inter text-gray-500 dark:text-gray-300"></span>
      </div>
    );
}