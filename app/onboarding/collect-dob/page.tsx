"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function CollectDobPage() {
  const { user, isLoaded } = useUser();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const getAge = (dateString: string): number => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }
    const age = getAge(dateOfBirth);
    if (age < 16) {
      setError("You must be at least 16 years old to use this app.");
      return;
    }
    setLoading(true);
    try {
      if (!user) {
        setError("User not loaded. Please try again.");
        setLoading(false);
        return;
      }
      await user.update({ unsafeMetadata: { dateOfBirth } });
      setSuccess(true);
      setTimeout(() => {
        router.push("/account");
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save date of birth.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white p-4">
      <section className="w-full max-w-md bg-white dark:bg-[#18122B] rounded-xl shadow-lg p-6 flex flex-col gap-6 border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-center" id="dob-heading">
          Complete your sign up
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          For privacy and safety, please confirm your date of birth. <br />
          <span className="font-medium">You must be at least 16 years old to use PromptHive.</span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-labelledby="dob-heading">
          <label htmlFor="dob-calendar" className="flex flex-col gap-1 font-medium">
            Date of Birth
            <DayPicker
              mode="single"
              selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
              onSelect={date => setDateOfBirth(date ? date.toISOString().split('T')[0] : '')}
              fromYear={new Date().getFullYear() - 100}
              toYear={new Date().getFullYear()}
              captionLayout="dropdown"
              showOutsideDays
              required
              id="dob-calendar"
              aria-label="Select your date of birth"
              disabled={date => date > new Date()}
              modifiersStyles={{
                selected: { backgroundColor: '#a855f7', color: 'white' },
                today: { borderColor: '#a855f7' },
              }}
              styles={{
                caption: { color: '#a855f7' },
                day: { borderRadius: '0.5rem', fontWeight: 500 },
              }}
            />
          </label>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            By continuing, you confirm you are at least 16 years old and agree to our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-purple-600 dark:text-purple-400">Privacy Policy</a>.
          </p>
          {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
          {success && <div className="text-green-500 text-sm" role="status">Date of birth saved! Redirecting…</div>}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-60"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
} 