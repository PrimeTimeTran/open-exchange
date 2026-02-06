'use client'

import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import {
  X,
  Send,
  Trash2,
  Upload,
  Loader2,
  Paperclip,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setDescription('')
      setFiles([])
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (typeof window === 'undefined') return null
  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    onClose()
  }

  return createPortal(
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />

      <div className='relative w-full max-w-2xl bg-surface border border-outline-variant rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between p-6 border-b border-outline-variant'>
          <h2 className='text-xl font-semibold text-on-surface flex items-center gap-2'>
            <MessageSquare className='w-5 h-5 text-primary' />
            Send Feedback
          </h2>
          <button
            onClick={onClose}
            className='p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='flex-1 overflow-y-auto p-6 space-y-6'
        >
          <div className='space-y-2'>
            <label className='text-sm font-medium text-on-surface'>Title</label>
            <Input
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-on-surface'>
              Description
            </label>
            <textarea
              className='flex min-h-[120px] w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-on-surface placeholder:text-on-surface-variant/50 resize-y'
              placeholder='Describe your suggestion, bug report, or feedback...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium text-on-surface flex items-center gap-2'>
              <Paperclip className='w-4 h-4' /> Attachments
            </label>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {files.map((file, i) => (
                <FilePreview
                  key={i}
                  file={file}
                  onRemove={() => removeFile(i)}
                />
              ))}

              <label className='flex flex-col items-center justify-center gap-2 aspect-video rounded-lg border-2 border-dashed border-outline-variant hover:bg-surface-variant/30 transition-colors cursor-pointer group bg-surface-variant/5'>
                <input
                  type='file'
                  multiple
                  accept='image/*'
                  className='hidden'
                  onChange={handleFileChange}
                />
                <div className='p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform'>
                  <Upload className='w-5 h-5' />
                </div>
                <span className='text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors'>
                  Add Image
                </span>
              </label>
            </div>
          </div>
        </form>

        <div className='p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface rounded-b-xl'>
          <Button
            type='button'
            variant='ghost'
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title || !description || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='w-4 h-4 mr-2' />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className='group relative aspect-video w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-variant/20'>
      {preview ? (
        <img
          src={preview}
          alt={file.name}
          className='h-full w-full object-cover transition-transform group-hover:scale-105'
        />
      ) : (
        <div className='flex h-full w-full flex-col items-center justify-center gap-2 text-on-surface-variant p-2'>
          <ImageIcon className='h-6 w-6' />
          <span className='text-[10px] text-center truncate w-full px-1'>
            {file.name}
          </span>
        </div>
      )}

      <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
        <p className='text-white text-xs font-medium truncate max-w-[80%] px-2'>
          {(file.size / 1024).toFixed(0)} KB
        </p>
      </div>

      <button
        type='button'
        onClick={onRemove}
        className='absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-error hover:text-on-error transition-colors opacity-0 group-hover:opacity-100'
      >
        <Trash2 className='w-3.5 h-3.5' />
      </button>
    </div>
  )
}
