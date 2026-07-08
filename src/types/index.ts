export type ProjectCategory =
  | "branding"
  | "editorial"
  | "identity"
  | "digital"
  | "art-direction";

export type AspectRatio = "portrait" | "landscape" | "square" | "wide";

export interface GalleryItem {
  id: string;
  file?: string;
  imagePath?: string;
  gradient: string;
  aspectRatio: AspectRatio;
  caption?: string;
  alt?: string;
}

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface ProjectImages {
  /** Resolved at build time when file exists in public/images/projects/[slug]/ */
  coverImage: string | null;
  heroImage: string | null;
  imageAlt: string;
  blurDataURL?: string;
  videoPlaceholder?: string | null;
}

export interface Project {
  slug: string;
  collectionId?: string;
  title: string;
  category: string;
  filterCategory: ProjectCategory;
  year: string;
  role: string;
  client: string;
  summary: string;
  description: string;
  concept: string;
  challenge: string;
  solution: string;
  visualDirection: string;
  typography: string;
  palette: PaletteColor[];
  galleryItems: GalleryItem[];
  tags: string[];
  gradient: string;
  aspectRatio: "portrait" | "landscape" | "square";
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  /** Gallery image filenames follow gallery-01.jpg, gallery-02.jpg, … */
  images: Omit<ProjectImages, "coverImage" | "heroImage" | "videoPlaceholder">;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  index: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  email: string;
  phone?: string;
  location: string;
  availability?: string;
  bio: string;
  philosophy: string;
  social: SocialLink[];
  portraitAlt: string;
  logoUrl?: string | null;
}

export type CategoryFilter = "all" | ProjectCategory;

export interface ResolvedProject extends Project {
  images: ProjectImages;
}

export interface ResolvedGalleryItem extends GalleryItem {
  src: string | null;
}
