/** Dark luxury blur placeholder — used until real images are added */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwA/AL+AAf/Z";

export function projectImagePath(slug: string, filename: string): string {
  return `/images/projects/${slug}/${filename}`;
}

export function portraitImagePath(filename = "portrait.jpg"): string {
  return `/images/${filename}`;
}

export const IMAGE_SIZES = {
  card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  cardWide: "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 66vw",
  hero: "100vw",
  gallery: "(max-width: 768px) 100vw, 50vw",
  galleryWide: "100vw",
  portrait: "(max-width: 1024px) 80vw, 420px",
  meta: "(max-width: 1024px) 100vw, 66vw",
} as const;
