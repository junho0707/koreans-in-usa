declare module 'pg' {
  export class Pool {
    constructor(config?: { connectionString?: string; ssl?: { rejectUnauthorized?: boolean } | boolean });
    query<T = unknown>(text: string, values?: unknown[]): Promise<{ rows: T[]; rowCount?: number | null }>;
  }
}

declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void) => void;
  export interface ExpectFn {
    (value: unknown): {
    toContain: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    not: {
      toContain: (expected: unknown) => void;
      toEqual: (expected: unknown) => void;
    };
    toBe: (expected: unknown) => void;
    } & Record<string, unknown>;
    arrayContaining: (items: unknown[]) => unknown;
  }
  export const expect: ExpectFn;
}

declare module 'vitest/config' {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
}

declare module 'rss-parser' {
  type Item = {
    title?: string;
    link?: string;
    contentSnippet?: string;
    isoDate?: string;
    [key: string]: unknown;
  };

  type Feed = {
    items?: Item[];
    [key: string]: unknown;
  };

  class RssParser {
    parseURL(url: string): Promise<Feed>;
  }

  export = RssParser;
}
