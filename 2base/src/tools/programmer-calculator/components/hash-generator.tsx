// Card components removed for cleaner design

export function HashGenerator() {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium">Hash & Checksum Generator</h3>
      <div className="h-64 bg-muted/20 rounded border-2 border-dashed border-muted flex items-center justify-center">
        <span className="text-muted-foreground">
          Hash Generator - Coming Soon
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        MD5, SHA-1, SHA-256, CRC32, and more
      </p>
    </div>
  );
}
