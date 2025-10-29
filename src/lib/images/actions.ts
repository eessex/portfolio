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
  createImageSchema, imageSchema
} from '@/lib/images/schemas'
import type {
  CreateImage,
  Image
} from '@/lib/images/types'
import type { FormResponse } from '@/lib/types'
import { formatDbResponseForClient } from '@/ui/util'

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
    console.info('checkIfImageExists')
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
  const clientFile = formData.get('file') as File | null
  const data: Record<FormData['entries']['name'], unknown> = Object.fromEntries(formData)

  if (clientFile) {
    console.info('Uploading file to S3:', clientFile.name)
    console.info('maybe existing url:', data.url, formData.get('url'))
    try {
      // check if file already exists in S3?
      const uploadedUrl = await uploadFile(clientFile)
      console.debug('File uploaded successfully. URL:', uploadedUrl)
      if ((data.url as string || '').length > 0) {
        // delete old file from S3
        await deleteFromS3(data.url as string)
      }
      data.url = uploadedUrl
      formData.delete('file')
    } catch (err) {
      console.error('Failed to upload file:', err)
      throw new Error('Failed to upload file.')
    } finally {
      console.info('Finished upload attempt for file:', clientFile.name)
    }
  }

  Object.entries(data).forEach(([n, v]) => {
    // maybe can remove
    if (v === 'file') {
      delete data[n]
    } else if (v === 'on') {
    // checkboxes are always 'on' when checked, so we convert them to true
      data[n] = true
    } else if (n.includes('Date')) {
      console.info('Parsing date for:', n, v)
      data[n] = v || undefined
    } else if (n === 'aspect') {
      console.debug('Converting aspect ratio to float:', n, v)
      data[n] = parseFloat(v as string)
    } else {
      console.debug('Form data entry:', n, v)
      data[n] = v
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
      const image = validatedImage.data
      const updatedImage = await updateImage(image)
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
      )
      VALUES (
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

export async function deleteImage (id: string): Promise<FormResponse<Image>> {
  try {
    const res = await sql`
      DELETE FROM images as i
      WHERE id = ${id}
      RETURNING i.url
    `
    await deleteFromS3(res[0].url)
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

  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutes
  return url
}

export async function uploadFile (file: File) {
  // 1. Request presigned URL from your backend (pass file name & type)
  const res = await getPresignedUploadUrl(file.name, file.type)
  // const { url } = await res.json()

  // 2. Upload file directly to S3
  const uploadRes = await fetch(res, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })

  if (!uploadRes.ok) throw new Error('Upload failed')

  return res.split('?')[0] // URL without query params (S3 object URL)
}

export async function saveImageMetadata ({
  alt,
  aspect,
  caption,
  isHiddenOnAboutPage,
  isPress,
  title,
  url
}: Image) {
  await sql<Image[]>`
    INSERT INTO images (
      alt,
      aspect,
      caption,
      created_at,
      is_hidden_on_about_page,
      is_press,
      title,
      url
    )
    VALUES (
      ${alt || null},
      ${aspect},
      ${caption || null},
      current_timestamp,
      ${isHiddenOnAboutPage || false},
      ${isPress || false},
      ${title || null},
      ${url}
    )
  `
}
