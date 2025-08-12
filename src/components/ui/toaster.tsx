import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="text-xs p-2 min-h-[2rem] max-w-[200px] pointer-events-auto">
            <div className="grid gap-0.5 flex-1">
              {title && <ToastTitle className="text-xs leading-tight">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs leading-tight">{description}</ToastDescription>
              )}
            </div>
            {action}
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-4 right-4 z-[100] flex max-h-screen flex-col-reverse p-4 pointer-events-none sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[280px]" />
    </ToastProvider>
  )
}
