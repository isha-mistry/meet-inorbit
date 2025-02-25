"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home,ShieldAlert } from "lucide-react"
import { APP_BASE_URL } from "@/config/constants"
import { useWalletAddress } from "@/app/hooks/useWalletAddress";

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {

  const { walletAddress } = useWalletAddress();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-lg w-full space-y-8 p-8">
        <div className="text-center">
          {/* <sShieldAlert className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
           */}
           <ShieldAlert className="mx-auto h-16 w-16 text-yellow-500 mb-4"/>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops! We hit a snag</h1>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-gray-600 mb-6" data-testid="error-message">
              Something went wrong !
            </p>
            {process.env.NODE_ENV === "development" && (
              <div className="bg-red-50 p-4 rounded-md mb-6">
                <p className="text-red-700 font-mono text-sm" data-testid="error-details">
                  {error.message}
                </p>
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={reset}
                data-testid="reset-button"
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => `${APP_BASE_URL}/profile/${walletAddress}?active=info`}
                data-testid="home-button"
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Return Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

