import { createContext, useContext, useState, useCallback } from 'react';

const EasterEggContext = createContext();

export function EasterEggProvider({ children }) {
  const [easterEgg, setEasterEgg] = useState(null); // null | 'fex' | 'matt'

  const triggerEgg = useCallback((name) => {
    const lower = name?.toLowerCase();
    if (lower === 'fex') {
      setEasterEgg((prev) => (prev === 'fex' ? null : 'fex'));
    } else if (lower === 'matt') {
      setEasterEgg((prev) => (prev === 'matt' ? null : 'matt'));
    }
  }, []);

  return (
    <EasterEggContext.Provider value={{ easterEgg, triggerEgg }}>
      {children}
    </EasterEggContext.Provider>
  );
}

export function useEasterEgg() {
  return useContext(EasterEggContext);
}
