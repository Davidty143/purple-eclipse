import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Content Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">The content you're looking for may have been deleted or is no longer available.</p>
        </div>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
