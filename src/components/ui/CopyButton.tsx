import { useState } from 'react'
import { Check, Copy } from '@phosphor-icons/react'
import { copyToClipboard } from '../../lib/share'
import { Button } from './Button'
import { useToast } from './Toast'

type CopyButtonProps = {
  text: string
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

export function CopyButton({
  text,
  label = 'Copy link',
  variant = 'secondary',
  size = 'sm',
  fullWidth = false,
  className,
}: CopyButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      toast('Link copied', 'success')
      window.setTimeout(() => setCopied(false), 1800)
    } else {
      toast('Could not copy. Select the link and copy manually', 'error')
    }
  }

  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} className={className} onClick={handleCopy}>
      {copied ? <Check size={16} weight="bold" /> : <Copy size={16} weight="bold" />}
      {copied ? 'Copied!' : label}
    </Button>
  )
}
