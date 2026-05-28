import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce } from "./debounce.js";

describe("debounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("invokes the wrapped function once after the delay", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        expect(fn).not.toHaveBeenCalled();

        vi.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("coalesces rapid calls into a single trailing invocation", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(50);
        debounced();
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    it("forwards the most recent arguments to the wrapped function", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced("first");
        debounced("second");
        debounced("third");
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledWith("third");
    });

    it("cancel() prevents the pending invocation from firing", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced();
        debounced.cancel();
        vi.advanceTimersByTime(200);

        expect(fn).not.toHaveBeenCalled();
    });

    it("cancel() is a no-op when no invocation is pending", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        expect(() => debounced.cancel()).not.toThrow();

        debounced();
        debounced.cancel();
        debounced.cancel();
        vi.advanceTimersByTime(200);

        expect(fn).not.toHaveBeenCalled();
    });

    it("can be reused after cancel()", () => {
        const fn = vi.fn();
        const debounced = debounce(fn, 100);

        debounced("a");
        debounced.cancel();
        debounced("b");
        vi.advanceTimersByTime(100);

        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith("b");
    });
});
