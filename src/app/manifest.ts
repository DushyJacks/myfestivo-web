import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyFestivo - Vizha",
    short_name: "MyFestivo",
    description:
      "MyFestivo is the all-in-one college event management platform. Discover, register, and host college fests, cultural events, tech hackathons, and sports events.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.jpg",
        sizes: "any",
        type: "image/jpeg",
      },
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
