/**
 * Polyfill for window.storage using localStorage.
 * This is used by the AI Studio generated code.
 */
if (typeof window !== 'undefined') {
  (window as any).storage = {
    get: async (key: string, _shared: boolean = false) => {
      console.log(`[Storage] GET ${key}`);
      const val = localStorage.getItem(key);
      return val ? { value: val } : null;
    },
    set: async (key: string, value: string, _shared: boolean = false) => {
      console.log(`[Storage] SET ${key}`);
      localStorage.setItem(key, value);
    },
    delete: async (key: string, _shared: boolean = false) => {
      console.log(`[Storage] DELETE ${key}`);
      localStorage.removeItem(key);
    }
  };
  console.log("[Storage] window.storage polyfill initialized.");
}
