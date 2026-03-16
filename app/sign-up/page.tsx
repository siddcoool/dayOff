import Link from "next/link"
import { SignupForm } from "@/components/signup-form"

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          DayOff
        </Link>
        <p className="text-sm text-muted-foreground">
          Create your account
        </p>
      </div>
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
