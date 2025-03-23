import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: {
      success: (message) => toast.success(message),
      error: (message) => toast.error(message),
      info: (message) => toast.info(message),
      warning: (message) => toast.warning(message),
      custom: ({ title, description, variant }) => {
        if (variant === "destructive") {
          return toast.error(description || title);
        }
        return toast(title, { description });
      }
    }
  };
};