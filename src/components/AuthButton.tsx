"use client";

import Image from "next/image";
import { useAuthStore } from "@/lib/auth-store";

interface AuthButtonProps {
  accountType: "source" | "destination";
  className?: string;
}

export default function AuthButton({
  accountType,
  className = "",
}: AuthButtonProps) {
  const { sourceAccount, destinationAccount, currentStep } = useAuthStore();
  const account = accountType === "source" ? sourceAccount : destinationAccount;
  const isConnected = account.isAuthenticated;

  const handleConnect = () => {
    window.location.href = `/api/auth/login?type=${accountType}`;
  };

  if (isConnected && account.user) {
    return (
      <div
        className={`flex items-center space-x-4 p-4 bg-spotify-green/20 border-2 border-spotify-green rounded-lg ${className}`}
      >
        <div className="flex-shrink-0">
          {account.user.images?.[0] ? (
            <Image
              src={account.user.images[0].url}
              alt={account.user.display_name || "User profile"}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full border-2 border-spotify-green"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {account.user.display_name?.charAt(0).toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="flex-grow text-left">
          <p className="font-semibold text-white text-lg">
            {account.user.display_name}
          </p>
          <p className="text-spotify-green font-medium">
            ✓ Connected Successfully
          </p>
          {account.user.followers && (
            <p className="text-gray-400 text-sm">
              {account.user.followers.total.toLocaleString()} followers
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className={`bg-spotify-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 ${className}`}
    >
      Connect {accountType === "source" ? "Old" : "New"} Account
    </button>
  );
}
