import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export default async function CompleteSignupPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const { userId } = await auth();

  // If user is already signed in, redirect to profile
  if (userId) {
    redirect("/profile");
  }

  // If no session_id, redirect to pricing
  if (!searchParams?.session_id) {
    redirect("/pricing");
  }

  // Get the checkout session
  const session = await stripe.checkout.sessions.retrieve(
    Array.isArray(searchParams.session_id)
      ? searchParams.session_id[0]
      : searchParams.session_id
  );
  
  if (!session) {
    redirect("/pricing");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Complete Your Account</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your account to access your subscription
          </p>
        </div>
        <SignUp
          afterSignUpUrl={`/profile?session_id=${Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : searchParams.session_id}`}
          redirectUrl={`/profile?session_id=${Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : searchParams.session_id}`}
        />
      </div>
    </div>
  );
} 