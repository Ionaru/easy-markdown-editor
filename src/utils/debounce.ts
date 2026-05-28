export interface Debounced<A extends unknown[]> {
    (...args: A): void;
    cancel(): void;
}

export const debounce = <A extends unknown[]>(
    fn: (...args: A) => void,
    ms: number,
): Debounced<A> => {
    let handle: ReturnType<typeof setTimeout> | undefined;
    const debounced = ((...args: A): void => {
        if (handle) {
            clearTimeout(handle);
        }
        handle = setTimeout(() => fn(...args), ms);
    }) as Debounced<A>;
    debounced.cancel = (): void => {
        if (handle) {
            clearTimeout(handle);
            handle = undefined;
        }
    };
    return debounced;
};
