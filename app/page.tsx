import { auth, signIn, signOut } from "@/auth"
import { SyncButton } from "@/app/components/SyncButton"
export default async function Home() {
  const session = await auth()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-hold">DevPulse</h1>
      {session?.user ? (
        <div className="flex flex-col items-center gap-2">
          <p>Signed in as <strong>{session.user.email}</strong></p>
          <form action = {async () => { "use server"; await signOut()}}>
            <button type = "submit" className="px-4 py-2 bg-red-500 text-white rounded">
              Sign Out
            </button>
          </form>
          <a href="/dashboard" className="text-blue-400 underline">
            Go to Dashboard
          </a>
          <SyncButton />
        </div>
      ):(
        <form action={async ()=> { "use server"; await signIn("github")}}>
          <button type="submit" className="px-4 py-2 bg-gray-800 text-white-rounded">
            Sign In with GitHub
          </button>
        </form>
      )}
    </main>
  )
}