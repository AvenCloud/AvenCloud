import { useState, useEffect, useRef } from 'react';

export default function useObservable(observable) {
  const isObservable = !!observable && !!observable.subscribe;

  const [value, setValue] = useState(
    isObservable ? observable.value : observable
  );

  const [error, setError] = useState(null);

  if (error) {
    throw error;
    // This component is basically broken at this point, because error will be thrown here until:
    // - A parent is responsible for catching the error and re-mounting us. OR
    // - The observable input changes and the effect clears the error
  }

  const lastRef = useRef(value);

  function applyValue(newValue) {
    // We use this lastRef to ensure that we will only setValue when the value has actually changed.
    // This is a good idea because some observables will re-emit identical values, and we'd rather not waste a render
    if (lastRef.current !== newValue) {
      lastRef.current = newValue;
      setValue(newValue);
    }
  }

  useEffect(
    () => {
      if (error) {
        setError(null);
      }
      if (isObservable) {
        const subscription = observable.subscribe(applyValue, setError);
        return () => subscription.unsubscribe();
      }
    },
    [observable]
  );

  return value;
}
