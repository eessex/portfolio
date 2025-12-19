'use server'

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { revalidatePath } from 'next/cache'
import postgres from 'postgres'

import {
  createImageSchema,
  imageSchema
} from '@/lib/images/schemas'
import type {
  CreateImage,
  Image
} from '@/lib/images/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/lib/util'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

const s3Prefix = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/images/`

function getKeyFromS3Url (url: string): string {
  try {
    const parsed = new URL(url)
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
  } catch {
    throw new Error(`Invalid S3 URL: ${url}`)
  }
}

function makeS3SafeKey (filename: string) {
  return encodeURIComponent(filename)
    // S3 allows slashes for "folders", so restore them if needed
    .replace(/%2F/g, '/')
}

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export async function checkIfImageExists (filename: string, id?: string): Promise<Image | false> {
  try {
    const formattedFilename = s3Prefix + makeS3SafeKey(filename)
    const [existingImage] = await sql<Image[]>`SELECT * from images WHERE url = ${formattedFilename}`
    if (existingImage && existingImage.id !== id) {
      console.debug('Image already exists:', existingImage.id, formattedFilename)
      return existingImage
    } else {
      return false
    }
  } catch (err) {
    console.error('Failed to check if image exists.', err)
    throw new Error('Failed to check if image exists.', { cause: err })
  }
}

export async function editImage (formData: FormData): Promise<FormResponse<Image>> {
  let validatedImage
  const clientFile = formData.get('file') as File | undefined
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)

  if (clientFile?.name && clientFile.size > 0) {
    try {
      const uploadedUrl = await uploadFile(clientFile)
      if ((data.url as string || '').length > 0) {
        await deleteFromS3(data.url as string)
      }
      data.url = uploadedUrl
      delete data.file
    } catch (err) {
      console.error('Failed to upload file:', err)
      throw new Error('Failed to upload file.')
    }
  }

  Object.entries(data).forEach(([n, v]) => {
    if (v === 'on') {
      // checkboxes are always 'on' when checked, so we convert them to true
      data[n] = true
    } else if (n.includes('Date')) {
      data[n] = v || undefined
    } else if (n === 'aspect') {
      data[n] = parseFloat(v as string)
    }
  })
  if (formData.get('id')) {
    validatedImage = imageSchema.safeParse(data)
  } else {
    validatedImage = createImageSchema.safeParse(data)
  }

  if (!validatedImage.success) {
    console.error('Failed to validate image.', validatedImage.error.flatten().fieldErrors)
    return {
      errors: validatedImage.error.flatten().fieldErrors,
      message: 'Failed to validate image.'
    }
  } else {
    try {
      const updatedImage = await updateImage(validatedImage.data)
      if (updatedImage) {
        console.debug('Image saved successfully:', updatedImage)
        revalidatePath('/dashboard/images')
        return {
          ok: true,
          res: updatedImage
        }
      }
    } catch (err) {
      console.error('Failed to save Image:', err)
      throw new Error('Failed to save Image.')
    }
  }
}

async function createImage (image: CreateImage) {
  try {
    const {
      aspect,
      caption,
      isHiddenOnAboutPage,
      isPress,
      title,
      url
    } = image
    return await sql<Image[]>`
      INSERT INTO images (
        aspect,
        created_at,
        caption,
        is_hidden_on_about_page,
        is_press,
        title,
        url
      ) VALUES (
        ${aspect},
        current_timestamp,
        ${caption || null},
        ${isHiddenOnAboutPage || null},
        ${isPress || null},
        ${title || null},
        ${url}
      )
      RETURNING *
    `.then(rows => formatDbResponseForClient(rows[0], imageSchema))
  } catch (err) {
    console.error('Error creating image:', err)
    throw new Error(err instanceof Error ? err.message : 'Failed to create image.')
  }
}

async function updateImage (image: CreateImage | Image) {
  if (!(image as Image).id) {
    try {
      return await createImage(image)
    } catch (err) {
      console.error('Error creating image:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to create image.')
    }
  } else {
    const {
      aspect,
      caption,
      isHiddenOnAboutPage,
      isPress,
      title,
      url
    } = image
    try {
      return await sql<Image[]>`
        UPDATE images
        SET (
          aspect,
          caption,
          is_hidden_on_about_page,
          is_press,
          title, 
          updated_at,
          url
        )
        = (
          ${aspect || null},
          ${caption || null},
          ${isHiddenOnAboutPage || null},
          ${isPress || null},
          ${title || null},
          current_timestamp,
          ${url}
        )
        WHERE id = ${(image as Image).id}
        RETURNING *
      `.then(rows => formatDbResponseForClient(rows[0], imageSchema))
    } catch (err) {
      console.error('Error updating image:', err)
      throw new Error('Failed to update image.')
    }
  }
}

export async function deleteImage (image: Image): Promise<FormResponse<Image>> {
  try {
    const [res] = await sql`
      DELETE FROM images as i
      WHERE id = ${image.id}
        OR url = ${image.url}
      RETURNING i.url
    `
    await deleteFromS3(res.url)
    revalidatePath('/dashboard/images')
    return { ok: true }
  } catch (err) {
    console.error('Error deleting image:', err)
    throw new Error('Failed to delete image.')
  }
}

async function deleteFromS3 (url: string) {
  const key = getKeyFromS3Url(url)
  try {
    const res = await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key
      })
    )
    console.info('Deleted old image from S3:', url, res)
  } catch (err) {
    console.error('Error deleting image from S3:', err)
  }
}

async function getPresignedUploadUrl (filename: string, contentType: string) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!
  const key = `images/${filename}`

  console.info('Generating presigned URL for:', key, bucketName)
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType
  })

  return await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes
}

export async function uploadFile (file: File) {
  const res = await getPresignedUploadUrl(file.name, file.type)
  const uploadRes = await fetch(res, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  return res.split('?')[0] // URL without query params
}
