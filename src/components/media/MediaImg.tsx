import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  quality?: number;
};

export function MediaImg({
  src,
  alt,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
  quality = 72,
}: Props) {
  if (!src.startsWith("/")) {
    return fill ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || "100vw"}
        className={className}
        priority={priority}
        quality={quality}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 1600}
      height={height || 1066}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={quality}
    />
  );
}
