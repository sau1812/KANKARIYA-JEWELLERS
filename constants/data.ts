// constants/data.ts
export const headerData = [
  { title: "HOME", href: "/" },
  {
    title: "CATALOG",
    href: "#",
   
    submenu: [
      { title: "Men's Bracelets", href: "/catalog/Menbracelet" },
      { title: "Women's Bracelets", href: "/catalog/womenbracelet" },
      { title: "Women's Necklace", href: "/catalog/womennecklace" },
      { title: "Unisex Bracelets", href: "/catalog/unisex-bracelets" },
    ],
  },
  {
    title: "MEN'S SECTION",
    href: "#",
    submenu: [
      { title: "Men's Bracelets", href: "/catalog/Menbracelet" },
    ],
  },
  {
    title: "WOMEN'S SECTION",
    href: "#",
    submenu: [
      { title: "Women's Bracelets", href: "/catalog/womenbracelet" },
      { title: "Women's Necklace", href: "/catalog/womennecklace" },
    ],
  },
  { title: "ABOUT US", href: "/about" },
  { title: "best sellerL", href: "/deal" },
];

export const productType = [
  { title : "Ring", value: "ring" },
  { title : "Necklace", value: "necklace" },
  { title : "Earring", value: "earring" },
  { title : "Bracelet", value: "bracelet" },
  { title : "Bangle", value: "bangle" },
];