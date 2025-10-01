import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DriveUploadForm } from "@/components/drive-upload-form"

export default function UploadPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Files</h1>
        <p className="text-muted-foreground">Upload files to your Google Drive</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upload to Google Drive</CardTitle>
          <CardDescription>Select files to upload to your connected Google Drive</CardDescription>
        </CardHeader>
        <CardContent>
          <DriveUploadForm />
        </CardContent>
      </Card>
    </div>
  )
}
