"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Upload, HardDrive, Clock, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface DriveStats {
  totalFiles: string
  storageUsed: string
  storageTotal: string
  recentUploads: string
  lastActivity: string
  user: string
}

export function DashboardContent() {
  const [stats, setStats] = useState<DriveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/drive/stats")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch statistics")
        }
        
        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err instanceof Error ? err.message : "Failed to load statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsConfig = [
    {
      title: "Total Items",
      value: stats?.totalFiles || "0",
      description: "Files and folders in your drive",
      icon: FolderOpen,
    },
    {
      title: "Storage Used",
      value: stats?.storageUsed || "0 GB",
      description: `of ${ "15 GB"} available`,
      icon: HardDrive,
    },
    {
      title: "Recent Uploads",
      value: stats?.recentUploads || "0",
      description: "in the last 7 days",
      icon: Upload,
    },
    {
      title: "Last Activity",
      value: stats?.lastActivity || "No activity",
      description: "Last file access",
      icon: Clock,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{stats?.user ? `, ${stats.user}` : ""}! Here's an overview of your Google Drive.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            <strong>Error loading statistics:</strong> {error}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Files Section */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
          <CardDescription>Your recently accessed files from Google Drive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No files yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Connect your Google Drive to start managing your files from this dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
