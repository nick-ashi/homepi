import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";

export function PageCarousel({ pages }: { pages: ReactNode[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: false });

  return (
    <div className="carousel" ref={emblaRef}>
      <div className="carousel-track">
        {pages.map((page, i) => (
          <div className="carousel-slide" key={i}>
            {page}
          </div>
        ))}
      </div>
    </div>
  );
}
