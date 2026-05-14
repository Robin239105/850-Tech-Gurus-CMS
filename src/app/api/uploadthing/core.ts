import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { getClientSession } from '@/lib/client-auth'
import { sql as db } from '@/lib/db'
import crypto from 'crypto'

const f = createUploadthing()


function detectType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text/')) return 'document'
  return 'other'
}

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 10 },
    video: { maxFileSize: '64MB', maxFileCount: 5 },
    pdf: { maxFileSize: '16MB', maxFileCount: 10 },
    'application/msword': { maxFileSize: '8MB', maxFileCount: 5 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '8MB', maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await getClientSession()
      if (!session) throw new Error('Unauthorized')
      return { clientId: session.clientId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const fileType = detectType(file.type)
        await db`
          INSERT INTO media_files (client_id, name, url, file_type, file_size, type, created_at)
          VALUES (
            ${metadata.clientId},
            ${file.name},
            ${file.ufsUrl ?? file.url},
            ${file.type},
            ${file.size},
            ${fileType},
            NOW()
          )
        `
      } catch (err) {
        console.error('Failed to save media file to DB:', err)
      }
      return { uploadedBy: metadata.clientId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
