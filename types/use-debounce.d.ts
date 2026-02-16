declare module 'use-debounce' {
    export function useDebouncedCallback<T extends (...args: any[]) => any>(
        callback: T,
        delay: number,
        options?: { maxWait?: number; leading?: boolean; trailing?: boolean }
    ): T;
}
