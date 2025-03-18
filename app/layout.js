import "./globals.css";

export const metadata = {
  title: "Intico Mining Reports",
  description: "Intico Mining Reports",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
