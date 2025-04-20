import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8faf8] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10 text-center">
        <div className="flex justify-center mb-2">
          <div className="text-[#79B791] font-semibold text-5xl relative">
            <span className="inline-block rounded-full bg-[#79B791] text-white px-4 py-1">é</span>
            <span className="text-[#13262F] ml-1">tude</span>
          </div>
        </div>
        <h1 className="text-2xl font-medium text-[#13262F]">Welcome to étude</h1>
        <p className="text-[#13262F]/70 text-sm">A beautiful and minimal note-taking application</p>

        <div className="flex flex-col space-y-3 mt-6">
          <Link
            href="/sign-in"
            className="w-full px-4 py-2.5 text-white bg-[#79B791] rounded-md hover:bg-[#ABD1B5] focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="w-full px-4 py-2.5 text-[#13262F] bg-white border border-[#ABD1B5]/40 rounded-md hover:bg-[#EDF4ED] focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
          >
            Create Account
          </Link>

          <Link
            href="/app"
            className="w-full px-4 py-2.5 text-[#13262F]/70 bg-transparent hover:bg-[#EDF4ED] focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:ring-offset-2 transition-colors duration-200 text-sm font-medium rounded-md"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </div>
  )
}
