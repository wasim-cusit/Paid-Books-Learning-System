import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Paid Books Learning System",
  description: "Secure paid learning platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
