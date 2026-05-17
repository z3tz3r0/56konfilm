'use client';

import { Carousel, type CarouselApi } from '@shared/components';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { useCallback, useEffect, useState } from 'react';

type ScrollableCarouselProps = React.ComponentProps<typeof Carousel>;

export default function ScrollableCarousel({
  children,
  plugins,
  setApi: externalSetApi,
  ...props
}: ScrollableCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  const handleSetApi = useCallback(
    (carouselApi: CarouselApi) => {
      setApi(carouselApi);
      if (externalSetApi) {
        externalSetApi(carouselApi);
      }
    },
    [externalSetApi]
  );

  useEffect(() => {
    if (!api) return;

    const handleNativeWheel = (event: WheelEvent) => {
      if (!event.shiftKey) return;
      event.preventDefault();

      const isScrollingRight = event.deltaY > 0 || event.deltaX > 0;
      if (isScrollingRight) {
        api.scrollNext();
      } else {
        api.scrollPrev();
      }
    };

    const carouselNode = api.rootNode();
    carouselNode.addEventListener('wheel', handleNativeWheel, {
      passive: false,
    });

    return () => carouselNode.removeEventListener('wheel', handleNativeWheel);
  }, [api]);

  return (
    <Carousel
      setApi={handleSetApi}
      plugins={[WheelGesturesPlugin(), ...(plugins || [])]}
      {...props}
    >
      {children}
    </Carousel>
  );
}
