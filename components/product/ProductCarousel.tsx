"use client";

import { ReactElement } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CarouselProductProps {
  children: ReactElement[];
  className?: string;
}

export default function CarouselProduct({
  children,
  className = "",
}: CarouselProductProps) {
  // Sử dụng children.length thay vì items cố định
  const itemsLength = children.length;

  return (
    <div className={`relative overflow-visible ${className}`}>
      <Carousel
        deferUntilVisible
        opts={{
          align: "center",
          loop: true,
          skipSnaps: false,
          duration: 25, // Tăng tốc độ transition để mượt hơn
          startIndex: Math.floor(itemsLength / 2), // Bắt đầu từ giữa
        }}
        className="w-full overflow-visible"
      >
        <div className="carousel-content-wrapper overflow-visible">
          <CarouselContent className="mx-4 overflow-visible">
            {children.map((child, index) => (
              <CarouselItem
                key={index}
                className="basis-auto overflow-visible pl-2 md:pl-4"
              >
                {child}
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  );
}
