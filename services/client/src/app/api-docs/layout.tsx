export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html>
        <body>{children}</body>
      </html>
    </>
  );
}
