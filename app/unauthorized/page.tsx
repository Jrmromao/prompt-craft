export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="mb-8 text-muted-foreground">You do not have permission to access this page.</p>
      <a href="/" className="text-primary underline">Go Home</a>
    </div>
  );
} 