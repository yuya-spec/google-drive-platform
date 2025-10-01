import { SigninForm } from "@/components/signin-form"

export default function SigninPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your management platform</p>
        </div>
        <SigninForm />
      </div>
    </div>
  )
}
