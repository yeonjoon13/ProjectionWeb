// components/SignUpButton.js
'use client'
import { useRouter } from 'next/navigation'; // Import useRouter

export default function SignUpButton() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <button 
      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
      onClick={handleSignUp}
    >
      Start Diagnosing
    </button>
  );
}
