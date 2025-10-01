import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DriveFilesList } from "@/components/drive-files-list"

export default function FilesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Files</h1>
          <p className="text-muted-foreground">Browse and manage your Google Drive files</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Google Drive Files</CardTitle>
          <CardDescription>Your files from Google Drive</CardDescription>
        </CardHeader>
        <CardContent>
          <DriveFilesList />
        </CardContent>
      </Card>
    </div>
  )
}
