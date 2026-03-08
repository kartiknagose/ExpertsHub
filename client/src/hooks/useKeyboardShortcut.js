// Custom hook for keyboard shortcuts
// Provides a clean way to add keyboard navigation and shortcuts

import { useEffect, useRef } from 'react';

/**
 * useKeyboardShortcuts Hook - For multiple shortcuts
 * @param {Array} shortcuts - Array of shortcut configs
 * 
 * Example:
 * useKeyboardShortcuts([
 *   { key: 'k', callback: openSearch, meta: true },
 *   { key: 'n', callback: createNew, meta: true },
 *   { key: 'Escape', callback: closeModal },
 * ]);
 */
export function useKeyboardShortcuts(shortcuts = []) {
  // Store shortcuts in ref to avoid infinite re-render from new array references
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => { shortcutsRef.current = shortcuts; });

  useEffect(() => {
    const handleKeyPress = (event) => {
      shortcutsRef.current.forEach(({ key, callback, ctrl = false, meta = false, shift = false, alt = false, preventDefault = true }) => {
        const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = meta ? (event.metaKey || event.ctrlKey) : !event.metaKey && !event.ctrlKey;
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const altMatch = alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          callback(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // Stable — reads from shortcutsRef.current
}
