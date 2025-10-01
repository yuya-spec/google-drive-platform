import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-foreground mb-4">Drive Management Platform</h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Manage your Google Drive files efficiently with our modern, professional platform
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
