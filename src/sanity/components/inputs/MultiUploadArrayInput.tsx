'use client'
import { UploadIcon } from '@sanity/icons'
import { Card, Flex, Spinner, Stack, Text, useToast } from '@sanity/ui'
import React, { useCallback, useState } from 'react'
import { ArrayOfObjectsInputProps, insert, setIfMissing, useClient } from 'sanity'

// Simple random key generator if not available
function randomKey(length = 12) {
    return Math.random().toString(36).substring(2, 2 + length)
}

export function MultiUploadArrayInput(props: ArrayOfObjectsInputProps) {
  const { onChange } = props
  const client = useClient({ apiVersion: '2024-01-01' })
  const toast = useToast()
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(async (files: File[]) => {
    if (isUploading) return
    if (files.length === 0) return

    const validFiles = files.filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
    const invalidFiles = files.filter((file) => !file.type.startsWith('image/') && !file.type.startsWith('video/'))

    if (invalidFiles.length > 0) {
      toast.push({
        title: 'Unsupported file types',
        description: 'Only images and videos are allowed.',
        status: 'warning',
      })
    }

    if (validFiles.length === 0) return

    setIsUploading(true)
    type UploadedItem = {
      _type: 'galleryItem'
      _key: string
      mediaType: 'image'
      media: {
        _type: 'mediaBlock'
        image: {
          _type: 'image'
          asset: { _type: 'reference'; _ref: string }
        }
      }
    } | {
      _type: 'galleryItem'
      _key: string
      mediaType: 'video'
      videoFile: {
        _type: 'file'
        asset: { _type: 'reference'; _ref: string }
      }
    }

    const uploadedItems: UploadedItem[] = []
    let successCount = 0
    let failureCount = 0

    try {
      const results = await Promise.allSettled(
        validFiles.map(async (file): Promise<UploadedItem> => {
          if (file.type.startsWith('image/')) {
            const assetDoc = await client.assets.upload('image', file, { filename: file.name })
            return {
              _type: 'galleryItem',
              _key: randomKey(),
              mediaType: 'image',
              media: {
                _type: 'mediaBlock',
                image: {
                  _type: 'image',
                  asset: { _type: 'reference', _ref: assetDoc._id },
                },
              },
            }
          }

          const assetDoc = await client.assets.upload('file', file, {
            filename: file.name,
            contentType: file.type,
          })
          return {
            _type: 'galleryItem',
            _key: randomKey(),
            mediaType: 'video',
            videoFile: {
              _type: 'file',
              asset: { _type: 'reference', _ref: assetDoc._id },
            },
          }
        })
      )

      for (const result of results) {
        if (result.status === 'fulfilled') {
          uploadedItems.push(result.value)
          successCount++
        } else {
          failureCount++
        }
      }

      if (uploadedItems.length > 0) {
        // Insert all at once
        onChange([
           setIfMissing([]),
           insert(uploadedItems, 'after', [-1])
        ])
        toast.push({ 
            title: `Successfully uploaded ${successCount} items`, 
            status: 'success' 
        })
      }

      if (failureCount > 0) {
        toast.push({
          title: 'Some uploads failed',
          description: `${failureCount} file${failureCount === 1 ? '' : 's'} failed to upload.`,
          status: 'error',
        })
      }
    } catch (err) {
      console.error('Upload failed:', err)
      toast.push({ 
          title: 'Upload failed', 
          description: err instanceof Error ? err.message : 'Unknown error',
          status: 'error' 
      })
    } finally {
      setIsUploading(false)
    }
  }, [client, onChange, toast, isUploading])

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = Array.from(e.dataTransfer.files)
    await uploadFiles(files)
  }, [uploadFiles])

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(e.clipboardData?.files ?? [])
    if (files.length === 0) return
    e.preventDefault()
    await uploadFiles(files)
  }, [uploadFiles])
  
  const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
  }, [])

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      
      <Card 
        data-testid="multi-upload-dropzone"
        padding={4} 
        tone="primary" 
        border 
        radius={2}
        style={{ borderStyle: 'dashed', cursor: isUploading ? 'wait' : 'pointer' }}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onPaste={handlePaste}
      >
        <Flex align="center" justify="center" direction="column" gap={3}>
             {isUploading ? <Spinner /> : <UploadIcon style={{fontSize: 24}} />}
             <Text size={1} muted>
               {isUploading ? 'Uploading & Processing...' : 'Drag & drop images/videos here to add to gallery'}
             </Text>
        </Flex>
      </Card>
    </Stack>
  )
}
