import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie
    .split(';')
    .map(entry => entry.split('=')[0].trim())
    .filter(Boolean)
    .forEach(name => {
      document.cookie = `${name}=; path=/; max-age=0`;
    });
});

afterEach(() => {
  vi.unstubAllGlobals();
});
