// constants/data.ts

export const headerData = [
  { title: "Home", href: "/" },
  {
    title: "Catalog",
    href: "#",
    submenu: [
      { title: "Men's bracelets", href: "/catalog/Menbracelet" },
      { title: "Women's bracelets", href: "/catalog/womenbracelet" },
      { title: "Women's necklace", href: "/catalog/womennecklace" },
      { title: "Unisex bracelets", href: "/catalog/unisex-bracelets" },
      { title: "Silver coins", href: "/catalog/coins" },
      { title: "Chains", href: "/catalog/chains" },
      { title: "Watches", href: "/catalog/watches" },
    ],
  },
  {
    title: "Men's section",
    href: "#",
    submenu: [
      { title: "Men's bracelets", href: "/catalog/Menbracelet" },
      { title: "Men's chains", href: "/catalog/men-chains" }, 
      { title: "Men's watches", href: "/catalog/men-watches" }, 
      { title: "Men's ring", href: "/catalog/men-ring" }, 
    ],
  },
  {
    title: "Women's section", 
    href: "#",
    submenu: [
      { title: "Women's bracelets", href: "/catalog/womenbracelet" },
      { title: "Women's necklace", href: "/catalog/womennecklace" },
      { title: "Women's chains", href: "/catalog/women-chains" }, 
      { title: "Women's watches", href: "/catalog/women-watches" }, 
      { title: "Women's ring", href: "/catalog/women-ring" }, 
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