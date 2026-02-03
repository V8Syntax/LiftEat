// Using automatic JSX runtime; no explicit React import needed
import { useToast } from "@/hooks/use-toast";
import {
  Toast as ToastPrimitive,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <ToastPrimitive key={id} {...(props as any)}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </ToastPrimitive>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
