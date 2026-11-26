import React from 'react';
import { vi } from 'vitest';

/** Shared state the engine mocks below read; tests set it per case. */
export const mockState = vi.hoisted(() => ({
  store: { settings: { blog: { allow_likes_and_comments: true } } } as Record<string, any>,
  theme: { settings: {} as Record<string, unknown> },
  bodyClasses: [] as string[],
  listCalls: [] as unknown[],
}));
