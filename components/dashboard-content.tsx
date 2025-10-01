import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderOpen, Upload, HardDrive, Clock } from "lucide-react"

export function DashboardContent() {
  const stats = [
    {
      title: "Total Files",
      value: "0",
      description: "Files in your drive",
      icon: FolderOpen,
    },
    {
      title: "Storage Used",
      value: "0 GB",
      description: "of 15 GB available",
      icon: HardDrive,
    },
    {
      title: "Recent Uploads",
      value: "0",
      description: "in the last 7 days",
      icon: Upload,
    },
    {
      title: "Last Activity",
      value: "Just now",
      description: "Last file access",
      icon: Clock,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your Google Drive.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
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
