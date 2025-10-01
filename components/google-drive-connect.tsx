"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"

export function GoogleDriveConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    // Check URL params for connection status
    const params = new URLSearchParams(window.location.search)
    const success = params.get("success")
    const error = params.get("error")

    if (success === "connected") {
      setIsConnected(true)
      setMessage({ type: "success", text: "Successfully connected to Google Drive!" })
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    } else if (error) {
      setMessage({ type: "error", text: `Connection failed: ${error}` })
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }

    // Check if already connected (check for cookie)
    fetch("/api/drive/files")
      .then((res) => {
        if (res.ok) {
          setIsConnected(true)
        } else if (res.status === 401) {
          setIsConnected(false)
          setMessage({ type: "error", text: "Authentication expired. Please reconnect." })
        }
      })
      .catch(() => {
        // Not connected
      })
  }, [])

  const handleConnect = () => {
    window.location.href = "/api/auth/google"
  }

  const handleDisconnect = () => {
    // Clear cookies by setting them to expire
    document.cookie = "google_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "google_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setIsConnected(false)
    setMessage({ type: "success", text: "Disconnected from Google Drive" })
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-foreground">Status</p>
          <p className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Not connected"}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={isConnected}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isConnected ? "Connected" : "Connect Google Drive"}
          </Button>
          {isConnected && (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
