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
      // Naye categories yahan add kar sakte hain (Aap apne hisaab se links change kar lena)
      { title: "Silver Coins", href: "/catalog/coins" },
      { title: "Chains", href: "/catalog/chains" },
      { title: "Watches", href: "/catalog/watches" },
    ],
  },
  {
    title: "MEN'S SECTION",
    href: "#",
    submenu: [
      { title: "Men's Bracelets", href: "/catalog/Menbracelet" },
      { title: "Men's Chains", href: "/catalog/men-chains" }, // Example addition
      { title: "Men's Watches", href: "/catalog/men-watches" }, // Example addition
      { title: "Men's Ring", href: "/catalog/men-ring" }, // Example addition
    ],
  },
  {
    title: "WOMEN'S SECTION", // Dhyan rakhein, yahan unisex nahi aayega jaisa aapka rule hai
    href: "#",
    submenu: [
      { title: "Women's Bracelets", href: "/catalog/womenbracelet" },
      { title: "Women's Necklace", href: "/catalog/womennecklace" },
      { title: "Women's Chains", href: "/catalog/women-chains" }, // Example addition
      { title: "Women's Watches", href: "/catalog/women-watches" }, // Example addition
      { title: "Women's Ring", href: "/catalog/women-ring" }, // Example addition
    ],
  },
  { title: "ABOUT US", href: "/about" },
  { title: "BEST SELLER 🔥", href: "/deal" }, // Typo fix kar diya 'best sellerL' ka
];

export const productType = [
  { title : "Ring", value: "ring" },
  { title : "Necklace", value: "necklace" },
  { title : "Earring", value: "earring" },
  { title : "Bracelet", value: "bracelet" },
  { title : "Bangle", value: "bangle" },
  // Sanity wale naye categories yahan add kar diye:
  { title : "Silver Coins", value: "coins" },
  { title : "Chains", value: "chains" },
  { title : "Watches", value: "watches" },
];