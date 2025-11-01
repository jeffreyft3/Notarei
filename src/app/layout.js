import "./globals.css";
import Navigation from "@/components/navigation/Navigation";

export const metadata = {
  title: "Notarei - AI-Powered Bias Detection",
  description: "Identify, analyze, and understand bias patterns in documents with collaborative features and comprehensive reporting.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/vfc0fqn.css"></link>
      </head>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
