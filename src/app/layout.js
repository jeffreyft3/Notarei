import "./globals.css";
import NavigationWrapper from "@/components/navigation/NavigationWrapper";

export const metadata = {
  title: "Notarei - AI-Powered Bias Detection",
  description: "Identify, analyze, and understand bias patterns in documents with collaborative features and comprehensive reporting.",
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }) {
  // Token retrieval handled by NavigationWrapper
  

  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/vfc0fqn.css"></link>
      </head>
      <body>
        <NavigationWrapper />
        {children}
      </body>
    </html>
  );
}
