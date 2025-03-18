import { ToastMessageOptions } from "primeng/api";

export function errorToast(error: Error, options?: Omit<ToastMessageOptions, 'summary' | 'severity' | 'detail'>): ToastMessageOptions {
    return {
        ...(options ?? {}),
        detail: error.message,
        summary: 'Error',
        severity: 'error'
    };
}

export function toastMessage(message: string, options?: Omit<ToastMessageOptions, 'detail'>): ToastMessageOptions {
    return {
        ...(options ?? {}),
        detail: message,
        severity: options?.severity ?? 'info',
        summary: options?.summary ?? 'Notification'
    }
}