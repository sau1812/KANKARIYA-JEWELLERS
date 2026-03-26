// constants/data.ts

export const headerData = [
  { title: "Home", href: "/" },
  {
    title: "Catalog",
    href: "#",
    submenu: [
      { title: "Bracelets", href: "/catalog/Menbracelet" },
      // { title: "Women's bracelets", href: "/catalog/womenbracelet" },
      { title: "Necklace", href: "/catalog/womennecklace" },
      // { title: "Unisex bracelets", href: "/catalog/unisex-bracelets" },
      { title: "Silver coins", href: "/catalog/coins" },
      { title: "Chains", href: "/catalog/chains" },
      // { title: "Watches", href: "/catalog/watches" },
    ],
  },
  {
    title: "Men's",
    href: "#",
    submenu: [
      { title: "Bracelets", href: "/catalog/Menbracelet" },
      { title: "Chains", href: "/catalog/men-chains" }, 
      { title: "Watches", href: "/catalog/men-watches" }, 
      { title: "Ring", href: "/catalog/men-ring" }, 
    ],
  },
  {
    title: "Women's", 
    href: "#",
    submenu: [
      { title: "Bracelets", href: "/catalog/womenbracelet" },
      { title: "Necklace", href: "/catalog/womennecklace" },
      { title: "Chains", href: "/catalog/women-chains" }, 
      // { title: "Watches", href: "/catalog/women-watches" }, 
      { title: "Ring", href: "/catalog/women-ring" }, 
    ],
  },
  { title: "About us", href: "/about" },
  { title: "Best seller 🔥", href: "/deal" }, 
];

export const productType = [
  { title: "Ring", value: "ring" },
  { title: "Necklace", value: "necklace" },
  { title: "Earring", value: "earring" },
  { title: "Bracelet", value: "bracelet" },
  { title: "Bangle", value: "bangle" },
  { title: "Silver coins", value: "coins" },
  { title: "Chains", value: "chains" },
  { title: "Watches", value: "watches" },
];