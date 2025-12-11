import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Aloqa AI Client Portal
          </h1>
        </div>

        {/* 404 Message */}
        <div className="mb-8">
          <h2 className="text-8xl font-bold text-indigo-600 mb-4">404</h2>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Page Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link 
            href="/auth/login"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you think this is an error, please{' '}
            <a 
              href="mailto:support@aloqa.ai"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}