"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileIcon, FolderOpen, RefreshCw, ExternalLink, ChevronLeft, Home } from "lucide-react"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  webViewLink?: string
  iconLink?: string
  parents?: string[]
}

interface BreadcrumbItem {
  id: string
  name: string
}

export function DriveFilesList() {
  const router = useRouter()
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string>("root")
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: "root", name: "My Drive" }])

  const fetchFiles = async (folderId: string = currentFolderId) => {
    setLoading(true)
    setError(null)
    try {
      const url = folderId === "root" 
        ? "/api/drive/files" 
        : `/api/drive/files?folderId=${folderId}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Failed to fetch files")
      }
      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files")
      // Navigate to settings page when fetch fails
      router.push("/dashboard/settings")
    } finally {
      setLoading(false)
    }
  }

  const navigateToFolder = async (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId)
    
    // Update breadcrumbs
    const newBreadcrumbs = [...breadcrumbs]
    const existingIndex = newBreadcrumbs.findIndex(b => b.id === folderId)
    
    if (existingIndex >= 0) {
      // If folder already exists in breadcrumbs, truncate from that point
      setBreadcrumbs(newBreadcrumbs.slice(0, existingIndex + 1))
    } else {
      // Add new folder to breadcrumbs
      setBreadcrumbs([...newBreadcrumbs, { id: folderId, name: folderName }])
    }
    
    await fetchFiles(folderId)
  }

  const navigateToBreadcrumb = async (folderId: string, index: number) => {
    setCurrentFolderId(folderId)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
    await fetchFiles(folderId)
  }

  const goBack = async () => {
    if (breadcrumbs.length > 1) {
      const parentIndex = breadcrumbs.length - 2
      const parentFolder = breadcrumbs[parentIndex]
      await navigateToBreadcrumb(parentFolder.id, parentIndex)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "N/A"
    const size = Number.parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isFolder = (mimeType: string) => {
    return mimeType === "application/vnd.google-apps.folder"
  }

  // Separate folders and files
  const folders = files.filter(file => isFolder(file.mimeType))
  const regularFiles = files.filter(file => !isFolder(file.mimeType))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => fetchFiles()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              {index === 0 && <Home className="h-4 w-4" />}
              {index > 0 && <span>/</span>}
              <button
                onClick={() => navigateToBreadcrumb(crumb.id, index)}
                className={`hover:text-foreground transition-colors ${
                  index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Back Button */}
        {breadcrumbs.length > 1 && (
          <div className="flex items-center gap-2">
            <Button onClick={() => goBack()} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No files found</h3>
          <p className="text-sm text-muted-foreground">This folder appears to be empty.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center gap-2">
            {index === 0 && <Home className="h-4 w-4" />}
            {index > 0 && <span>/</span>}
            <button
              onClick={() => navigateToBreadcrumb(crumb.id, index)}
              className={`hover:text-foreground transition-colors ${
                index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        {breadcrumbs.length > 1 && (
          <Button onClick={() => goBack()} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button onClick={() => fetchFiles()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Folders Section */}
      {folders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <Card 
                key={folder.id} 
                className="border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToFolder(folder.id, folder.name)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <FolderOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Folder • Modified {formatDate(folder.modifiedTime)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {regularFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {regularFiles.map((file) => (
              <Card key={file.id} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {file.iconLink ? (
                        <img src={file.iconLink || "/placeholder.svg"} alt="" className="w-8 h-8" />
                      ) : (
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • Modified {formatDate(file.modifiedTime)}
                      </p>
                    </div>
                    {file.webViewLink && (
                      <Button asChild variant="ghost" size="sm">
                        <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
