'use client';

import { useSession, signIn } from "next-auth/react";
import React from "react";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur bg-transparent z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          <p className="text-sm text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        {children}
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/10 z-50">
        <div className="text-center p-6 bg-transparent rounded-xl shadow-xl border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sign in to continue</h2>
          <button
            onClick={() => signIn("google")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login with Google
          </button>
        </div>
      </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
