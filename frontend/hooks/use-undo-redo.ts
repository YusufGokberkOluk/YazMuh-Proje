import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
  maxHistorySize?: number;
  initialState: T;
}

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useUndoRedo<T>({ maxHistorySize = 50, initialState }: UseUndoRedoOptions<T>) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;

    setState(currentState => {
      const { past, present, future } = currentState;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      };
    });
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    setState(currentState => {
      const { past, present, future } = currentState;
      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture
      };
    });
  }, [canRedo]);

  const set = useCallback((newPresent: T, shouldAddToHistory = true) => {
    if (!shouldAddToHistory) {
      setState(currentState => ({
        ...currentState,
        present: newPresent
      }));
      return;
    }

    setState(currentState => {
      const { past, present } = currentState;
      
      // Don't add to history if the state hasn't changed
      if (JSON.stringify(present) === JSON.stringify(newPresent)) {
        return currentState;
      }

      const newPast = [...past, present];
      
      // Limit history size
      if (newPast.length > maxHistorySize) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newPresent,
        future: []
      };
    });
  }, [maxHistorySize]);

  // Debounced version for rapid changes (like typing)
  const setDebounced = useCallback((newPresent: T, delay = 1000) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update present state immediately (without adding to history)
    setState(currentState => ({
      ...currentState,
      present: newPresent
    }));

    // Add to history after delay
    timeoutRef.current = setTimeout(() => {
      setState(currentState => {
        const { past, present } = currentState;
        
        // Don't add if it's the same as the last item in history
        const lastHistoryItem = past[past.length - 1];
        if (lastHistoryItem && JSON.stringify(lastHistoryItem) === JSON.stringify(present)) {
          return currentState;
        }

        const newPast = [...past, present];
        
        if (newPast.length > maxHistorySize) {
          newPast.shift();
        }

        return {
          past: newPast,
          present: newPresent,
          future: []
        };
      });
    }, delay);
  }, [maxHistorySize]);

  const reset = useCallback((newInitialState: T) => {
    setState({
      past: [],
      present: newInitialState,
      future: []
    });
  }, []);

  const clear = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  return {
    state: state.present,
    canUndo,
    canRedo,
    undo,
    redo,
    set,
    setDebounced,
    reset,
    clear
  };
} 