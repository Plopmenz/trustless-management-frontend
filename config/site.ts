export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Trustless Management",
  description: "Decentralized permission management solution",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
  ],
} as const
