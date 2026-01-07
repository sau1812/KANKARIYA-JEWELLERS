import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio",
  description: "Backend Management",
};

// 👇 Ye "export default function" hona zaroori hai
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}