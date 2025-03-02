import React from 'react';

/**
 * Identical to React.useEffect, except that it never runs on mount. This is
 * the equivalent of the componentDidUpdate lifecycle function.
 *
 * @param {function:function} effect - A useEffect effect.
 * @param {array} [dependencies] - useEffect dependency list.
 */
export const useDidMountEffect = (effect, dependencies) => {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (mounted.current) {
      const unmount = effect();
      return () => unmount && unmount();
    }
    mounted.current = true;
  }, dependencies);

  // Reset on unmount for the next mount.
  React.useEffect(() => () => (mounted.current = false), []);
};
