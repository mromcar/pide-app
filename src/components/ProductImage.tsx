import Image from 'next/image'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-48">
      <Image
        src={`/images/${src}`}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
