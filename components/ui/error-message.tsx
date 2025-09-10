import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  variant?: 'error' | 'warning' | 'info'
  title?: string
  message: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }>
  className?: string
}

const variantConfig = {
  error: {
    icon: XCircle,
    className: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    iconClassName: 'text-red-600 dark:text-red-400',
    titleClassName: 'text-red-800 dark:text-red-200',
    messageClassName: 'text-red-700 dark:text-red-300'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
    titleClassName: 'text-yellow-800 dark:text-yellow-200',
    messageClassName: 'text-yellow-700 dark:text-yellow-300'
  },
  info: {
    icon: Info,
    className: 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
    iconClassName: 'text-blue-600 dark:text-blue-400',
    titleClassName: 'text-blue-800 dark:text-blue-200',
    messageClassName: 'text-blue-700 dark:text-blue-300'
  }
}

export function ErrorMessage({ 
  variant = 'error', 
  title, 
  message, 
  actions, 
  className 
}: ErrorMessageProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn('rounded-lg border p-4', config.className, className)}>
      <div className="flex">
        <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconClassName)} />
        <div className="ml-3 flex-1">
          {title && (
            <h4 className={cn('font-medium text-sm mb-1', config.titleClassName)}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', config.messageClassName)}>
            {message}
          </p>
          {actions && actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
