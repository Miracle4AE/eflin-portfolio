import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "nocturne",
    title: "Nocturne",
    category: "Brand Identity",
    filterCategory: "branding",
    year: "2025",
    role: "Lead Designer",
    client: "Nocturne Parfums · Paris",
    summary:
      "Identity for an independent fragrance house — quiet typography, dark surfaces, and a system that lets the product speak first.",
    description:
      "Identity for an independent fragrance house — quiet typography, dark surfaces, and a system that lets the product speak first.",
    concept:
      "Nocturne builds a brand around what is withheld. The mark is minimal; the palette stays near-black; copy is sparse. The goal was an identity that feels like the pause before a scent settles on skin.",
    challenge:
      "The client sells through selective retail and private appointments — not mass e-commerce. The identity needed to feel considered at counter scale and confident in press, without the visual noise typical of the category.",
    solution:
      "We developed a wordmark with extended tracking and a single accent rule used across boxes, letterhead, and digital. Photography direction favours shadow over product hero shots. Guidelines fit twelve pages because restraint was the point.",
    visualDirection:
      "Near-monochrome. Soft contrast. Glass, matte paper, and skin tones as the only warmth. No ornament.",
    typography:
      "Didot for product names and campaign lines. Suisse Int'l for specifications, legal, and UI. The serif carries desire; the sans carries fact.",
    palette: [
      { name: "Void", hex: "#0a0a0a" },
      { name: "Ink", hex: "#1a1a2e" },
      { name: "Smoke", hex: "#3d3d3d" },
      { name: "Skin", hex: "#e8e0d4" },
      { name: "Brass", hex: "#a68b5b" },
    ],
    galleryItems: [
      {
        id: "n1",
        file: "gallery-01.jpg",
        gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
        aspectRatio: "wide",
        caption: "Logotype and primary mark",
        alt: "Nocturne Parfums wordmark on black packaging",
      },
      {
        id: "n2",
        file: "gallery-02.jpg",
        gradient: "from-[#0f3460] via-[#1a1a2e] to-[#16213e]",
        aspectRatio: "portrait",
        caption: "Carton and bottle label",
        alt: "Nocturne fragrance packaging detail",
      },
      {
        id: "n3",
        file: "gallery-03.jpg",
        gradient: "from-[#16213e] to-[#1a1a2e]",
        aspectRatio: "landscape",
        caption: "Stationery suite",
        alt: "Nocturne letterhead and business cards",
      },
      {
        id: "n4",
        file: "gallery-04.jpg",
        gradient: "from-[#1a1a2e] via-[#0f3460] to-[#16213e]",
        aspectRatio: "square",
        caption: "Campaign still life",
        alt: "Nocturne art-directed product photography",
      },
    ],
    tags: ["Brand Identity", "Packaging", "Art Direction"],
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    aspectRatio: "portrait",
    featured: true,
    images: {
      imageAlt: "Nocturne Parfums brand identity — logotype, packaging, and stationery",
    },
  },
  {
    slug: "meridian",
    title: "Meridian",
    category: "Editorial Design",
    filterCategory: "editorial",
    year: "2025",
    role: "Editorial Designer",
    client: "Meridian Press · London",
    summary:
      "Design system for an art book series — grid, pacing, and typographic hierarchy built to survive 200+ pages per volume.",
    description:
      "Design system for an art book series — grid, pacing, and typographic hierarchy built to survive 200+ pages per volume.",
    concept:
      "Meridian treats each book as a sequence of rooms. Margins are generous; images breathe; text enters only when it adds context. The series should feel consistent on a shelf yet distinct inside each cover.",
    challenge:
      "Three titles per year, different artists, different paper stocks, one printer. The system had to accommodate varied image ratios and essay lengths without redesigning from scratch each time.",
    solution:
      "A modular grid with fixed typographic roles: display, body, caption, colophon. Chapter openers use a single horizontal rule as a recurring motif. Colour is limited to black, warm grey, and one accent chosen per artist.",
    visualDirection:
      "Swiss restraint with room for photography. Uncoated stock. No full-bleed text. Captions always separated from images.",
    typography:
      "Neue Haas Grotesk Display for titles. Lyon Text for essays at 10/15. Letter Gothic for metadata and imprints.",
    palette: [
      { name: "Black", hex: "#0a0a0a" },
      { name: "Warm Grey", hex: "#6b6560" },
      { name: "Paper", hex: "#f0ebe3" },
      { name: "Rule", hex: "#c4a574" },
      { name: "White", hex: "#faf9f7" },
    ],
    galleryItems: [
      {
        id: "m1",
        file: "gallery-01.jpg",
        gradient: "from-[#2c2c2c] via-[#3d3d3d] to-[#1a1a1a]",
        aspectRatio: "wide",
        caption: "Series cover grid",
        alt: "Meridian Press art book series covers",
      },
      {
        id: "m2",
        file: "gallery-02.jpg",
        gradient: "from-[#1a1a1a] via-[#2c2c2c] to-[#3d3d3d]",
        aspectRatio: "landscape",
        caption: "Interior spread",
        alt: "Meridian book interior photography spread",
      },
      {
        id: "m3",
        file: "gallery-03.jpg",
        gradient: "from-[#3d3d3d] to-[#2c2c2c]",
        aspectRatio: "portrait",
        caption: "Typographic chapter opener",
        alt: "Meridian editorial typography layout",
      },
    ],
    tags: ["Editorial", "Typography", "Print"],
    gradient: "from-[#2c2c2c] via-[#3d3d3d] to-[#1a1a1a]",
    aspectRatio: "landscape",
    featured: true,
    images: {
      imageAlt: "Meridian Press editorial design — art book series",
    },
  },
  {
    slug: "solstice",
    title: "Solstice",
    category: "Visual Identity",
    filterCategory: "identity",
    year: "2024",
    role: "Identity Designer",
    client: "Solstice Pavilion · Oslo",
    summary:
      "Seasonal identity for a contemporary exhibition programme — one structure, shifting palette, twelve shows a year.",
    description:
      "Seasonal identity for a contemporary exhibition programme — one structure, shifting palette, twelve shows a year.",
    concept:
      "Solstice marks time through colour temperature. Summer editions lean warm; winter editions cool down — but the logotype, grid, and poster format never change. Visitors learn to read season through hue, not layout.",
    challenge:
      "The pavilion programmes performance, installation, and talks under one roof. Signage, tickets, and social assets had to update weekly without looking improvised.",
    solution:
      "We built a fixed poster architecture: title top, date block bottom, accent band indicating season. Digital templates lock type sizes; only the band colour and hero image swap. Wayfinding uses the same band system on walls.",
    visualDirection:
      "Institutional clarity with seasonal warmth. Large type, small metadata. Photography cropped hard; never decorative.",
    typography:
      "FK Grotesk for all operational type. Portrait for exhibition titles when the artist name is the headline.",
    palette: [
      { name: "Winter", hex: "#1b263b" },
      { name: "Spring", hex: "#5a7a6a" },
      { name: "Summer", hex: "#c4a574" },
      { name: "Autumn", hex: "#6b4a3a" },
      { name: "Paper", hex: "#f5f2eb" },
    ],
    galleryItems: [
      {
        id: "s1",
        file: "gallery-01.jpg",
        gradient: "from-[#4a3728] via-[#8b6914] to-[#2c1810]",
        aspectRatio: "wide",
        caption: "Poster system — four seasons",
        alt: "Solstice Pavilion seasonal poster series",
      },
      {
        id: "s2",
        file: "gallery-02.jpg",
        gradient: "from-[#8b6914] via-[#4a3728] to-[#2c1810]",
        aspectRatio: "portrait",
        caption: "Exhibition announcement",
        alt: "Solstice Pavilion exhibition poster",
      },
      {
        id: "s3",
        file: "gallery-03.jpg",
        gradient: "from-[#2c1810] via-[#8b6914] to-[#4a3728]",
        aspectRatio: "square",
        caption: "Wayfinding band detail",
        alt: "Solstice Pavilion environmental graphics",
      },
      {
        id: "s4",
        file: "gallery-04.jpg",
        gradient: "from-[#4a3728] to-[#8b6914]",
        aspectRatio: "landscape",
        caption: "Programme booklet",
        alt: "Solstice Pavilion printed programme",
      },
    ],
    tags: ["Identity", "Signage", "Print"],
    gradient: "from-[#4a3728] via-[#8b6914] to-[#2c1810]",
    aspectRatio: "square",
    featured: true,
    images: {
      imageAlt: "Solstice Pavilion visual identity — posters and signage",
    },
  },
  {
    slug: "atlas",
    title: "Atlas",
    category: "Art Direction",
    filterCategory: "art-direction",
    year: "2024",
    role: "Art Director",
    client: "Atlas Journal · Remote / Field",
    summary:
      "Art direction for a travel publication — cartographic thinking, field photography, and layouts that carry distance on the page.",
    description:
      "Art direction for a travel publication — cartographic thinking, field photography, and layouts that carry distance on the page.",
    concept:
      "Atlas maps journeys as lines, not landmarks. Routes cross spreads; captions sit like coordinates; empty space suggests distance travelled. The reader should feel the gap between places.",
    challenge:
      "Contributors shoot on different formats across six continents. The art direction had to unify phone footage, 35mm scans, and medium-format work without over-retouching.",
    solution:
      "A desaturated grade and consistent margin treatment tie disparate sources together. Maps drawn in-house become chapter dividers. Pull quotes use a single size and position — a visual anchor through variable content.",
    visualDirection:
      "Documentary tone. Muted colour. Maps as graphic elements, not decoration. Type small and precise; images large.",
    typography:
      "Graphik for navigation and captions. Tiempos Headline for feature titles. Monospace for coordinates and page metadata.",
    palette: [
      { name: "Ocean", hex: "#0d1b2a" },
      { name: "Trail", hex: "#415a77" },
      { name: "Sand", hex: "#c4b8a8" },
      { name: "Paper", hex: "#f5f0e8" },
      { name: "Route", hex: "#c4a574" },
    ],
    galleryItems: [
      {
        id: "a1",
        file: "gallery-01.jpg",
        gradient: "from-[#0d1b2a] via-[#1b263b] to-[#415a77]",
        aspectRatio: "wide",
        caption: "Feature spread with route map",
        alt: "Atlas Journal editorial spread with map",
      },
      {
        id: "a2",
        file: "gallery-02.jpg",
        gradient: "from-[#415a77] via-[#0d1b2a] to-[#1b263b]",
        aspectRatio: "square",
        caption: "Cover treatment",
        alt: "Atlas Journal magazine cover",
      },
      {
        id: "a3",
        file: "gallery-03.jpg",
        gradient: "from-[#1b263b] to-[#415a77]",
        aspectRatio: "landscape",
        caption: "Field photography grid",
        alt: "Atlas Journal photo essay layout",
      },
    ],
    tags: ["Art Direction", "Editorial", "Photography"],
    gradient: "from-[#0d1b2a] via-[#1b263b] to-[#415a77]",
    aspectRatio: "landscape",
    featured: true,
    images: {
      imageAlt: "Atlas Journal art direction — editorial spreads and maps",
    },
  },
  {
    slug: "verdant",
    title: "Verdant",
    category: "Packaging & Illustration",
    filterCategory: "branding",
    year: "2024",
    role: "Illustrator & Designer",
    client: "Verdant Apothecary · Portland",
    summary:
      "Botanical illustration and packaging for a small-batch apothecary — drawn from specimen, printed on uncoated stock.",
    description:
      "Botanical illustration and packaging for a small-batch apothecary — drawn from specimen, printed on uncoated stock.",
    concept:
      "Each product line is tied to one plant, drawn life-size from dried samples. Illustration is documentation, not decoration — the label tells you what is inside before you read the copy.",
    challenge:
      "Shelf space is limited; labels must read at arm's length. Regulatory text competes with brand expression on a 60mm wide tube.",
    solution:
      "Hierarchy is strict: plant name largest, illustration centre, ingredients smallest. Two greens and cream only — no third accent. Tubes and boxes share one template; only the illustration swaps.",
    visualDirection:
      "Apothecary quiet. Visible paper grain. Ink line work, no fills. Photography limited to ingredient still lifes.",
    typography:
      "Satisfy for product names — hand-feel without script cliché. IBM Plex Sans for ingredients and barcodes.",
    palette: [
      { name: "Deep Green", hex: "#1b4332" },
      { name: "Leaf", hex: "#40916c" },
      { name: "Mist", hex: "#95d5b2" },
      { name: "Cream", hex: "#f5f0e8" },
      { name: "Ink", hex: "#1a1a1a" },
    ],
    galleryItems: [
      {
        id: "v1",
        file: "gallery-01.jpg",
        gradient: "from-[#1b4332] via-[#2d6a4f] to-[#40916c]",
        aspectRatio: "portrait",
        caption: "Original botanical drawings",
        alt: "Verdant Apothecary botanical illustration series",
      },
      {
        id: "v2",
        file: "gallery-02.jpg",
        gradient: "from-[#40916c] via-[#1b4332] to-[#2d6a4f]",
        aspectRatio: "landscape",
        caption: "Packaging family",
        alt: "Verdant product packaging line",
      },
      {
        id: "v3",
        file: "gallery-03.jpg",
        gradient: "from-[#2d6a4f] to-[#40916c]",
        aspectRatio: "square",
        caption: "Tube label detail",
        alt: "Verdant tube label typography close-up",
      },
    ],
    tags: ["Illustration", "Packaging", "Print"],
    gradient: "from-[#1b4332] via-[#2d6a4f] to-[#40916c]",
    aspectRatio: "portrait",
    featured: false,
    images: {
      imageAlt: "Verdant Apothecary illustration and packaging system",
    },
  },
  {
    slug: "echo",
    title: "Echo",
    category: "Digital Design",
    filterCategory: "digital",
    year: "2023",
    role: "Digital Designer",
    client: "Echo Platform · Berlin",
    summary:
      "Interactive identity for a cultural streaming platform — motion logic, responsive mark, and a UI language that scales from mobile to cinema.",
    description:
      "Interactive identity for a cultural streaming platform — motion logic, responsive mark, and a UI language that scales from mobile to cinema.",
    concept:
      "Echo's mark responds to sound — expanding and contracting with audio amplitude in digital contexts, static in print. The idea: identity that listens. UI components inherit the same pulse logic at micro-interaction scale.",
    challenge:
      "The platform aggregates theatre, dance, and artist talks. Categories differ in tone; the interface could not feel like Netflix or a museum site — it needed a third register.",
    solution:
      "We defined three layout modes: performance (full-bleed video), conversation (split text/video), and archive (grid). The mark animation runs only on hover and load — never loops distractingly. Dark mode is default; light mode for institutional partners.",
    visualDirection:
      "Dark interface, soft white type, one violet accent. Thumbnails cropped to 3:2. Motion under 400ms everywhere.",
    typography:
      "Inter for UI. Instrument Serif for programme titles and artist names. Tabular figures for duration metadata.",
    palette: [
      { name: "Background", hex: "#0a0a0a" },
      { name: "Surface", hex: "#141414" },
      { name: "Violet", hex: "#5a189a" },
      { name: "Text", hex: "#f5f2eb" },
      { name: "Muted", hex: "#7a7670" },
    ],
    galleryItems: [
      {
        id: "e1",
        file: "gallery-01.jpg",
        gradient: "from-[#3c096c] via-[#5a189a] to-[#240046]",
        aspectRatio: "wide",
        caption: "Home screen — performance mode",
        alt: "Echo Platform digital interface home screen",
      },
      {
        id: "e2",
        file: "gallery-02.jpg",
        gradient: "from-[#240046] via-[#3c096c] to-[#5a189a]",
        aspectRatio: "wide",
        caption: "Responsive mark behaviour",
        alt: "Echo Platform animated logo states",
      },
      {
        id: "e3",
        file: "gallery-03.jpg",
        gradient: "from-[#5a189a] to-[#3c096c]",
        aspectRatio: "portrait",
        caption: "Mobile programme view",
        alt: "Echo Platform mobile app screens",
      },
    ],
    tags: ["Digital", "Motion", "Identity"],
    gradient: "from-[#3c096c] via-[#5a189a] to-[#240046]",
    aspectRatio: "portrait",
    featured: false,
    images: {
      imageAlt: "Echo Platform interactive identity and UI design",
    },
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const showcaseProject = projects[0];
