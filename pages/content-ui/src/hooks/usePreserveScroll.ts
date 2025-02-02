import { useRef, useLayoutEffect, useState } from 'react';

export function usePreserveScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const scrollPos = useRef(0);
  // const [scrollPos, setScrollPos] = useState<{ current: number }>({ current: 0 });
  console.log('usePreserveScroll init', ref.current, scrollPos.current);
  // const previousValueRef = useRef<number>(0)
  let isRendered = true;
  useLayoutEffect(() => {
    console.log('usePreserveScroll', ref.current, scrollPos.current);
    const element = ref.current;
    if (element) {
      requestAnimationFrame(() => {
        element.scrollTop = scrollPos.current;
      });
    }
  });

  const onScroll = () => {
    const element = ref.current;
    if (isRendered) {
      isRendered = false;
      return;
    }
    if (element) {
      console.log('usePreserveScroll2', ref.current, scrollPos.current, element.scrollTop);
      scrollPos.current = element.scrollTop;
      // setScrollPos({ current: element.scrollTop });
    }
  };

  return { ref, onScroll };
}
