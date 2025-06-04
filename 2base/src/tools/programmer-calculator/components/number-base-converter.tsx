// Card components removed for cleaner design
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import type { Base } from "../types";

interface NumberBaseConverterProps {
  currentValue: string;
  currentBase: Base;
  onValueChange: (value: string) => void;
  onBaseChange: (base: Base) => void;
}

export function NumberBaseConverter({
  currentValue,
  currentBase,
  onValueChange,
  onBaseChange,
}: NumberBaseConverterProps) {
  // Common bases data
  const commonBases = [
    { base: 2 as Base, name: "Binary", prefix: "0b", example: "11010110" },
    { base: 8 as Base, name: "Octal", prefix: "0o", example: "326" },
    { base: 10 as Base, name: "Decimal", prefix: "", example: "214" },
    { base: 16 as Base, name: "Hexadecimal", prefix: "0x", example: "D6" },
  ];

  // Encoding bases (placeholder)
  const encodingBases = [
    { name: "Base32", example: "MFRGG===" },
    { name: "Base58", example: "3yZe7d" },
    { name: "Base64", example: "1tc=" },
  ];

  return (
    <div className="w-full space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-medium">
            Universal Number Base Converter
          </h3>
          <Badge variant="secondary">Live Sync</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Convert between multiple number bases with real-time synchronization
        </p>
      </div>
      <div>
        <Tabs defaultValue="common" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="common">Common Bases</TabsTrigger>
            <TabsTrigger value="encoding">Encoding Bases</TabsTrigger>
            <TabsTrigger value="custom">Custom Base</TabsTrigger>
          </TabsList>

          {/* Common Number Bases */}
          <TabsContent value="common" className="space-y-4">
            <div className="space-y-4">
              {commonBases.map((baseInfo) => {
                const isActive = currentBase === baseInfo.base;
                const displayValue = isActive ? currentValue : "0"; // TODO: Convert value to this base

                return (
                  <div
                    key={baseInfo.base}
                    className={`p-4 rounded-lg border ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">
                          {baseInfo.name} (Base {baseInfo.base})
                        </Label>
                        {isActive && <Badge variant="default">Active</Badge>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          /* TODO: Copy to clipboard */
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground min-w-[2rem]">
                        {baseInfo.prefix}
                      </span>
                      <Input
                        value={displayValue}
                        onChange={(e) => {
                          if (isActive) {
                            onValueChange(e.target.value);
                          } else {
                            onBaseChange(baseInfo.base);
                            onValueChange(e.target.value);
                          }
                        }}
                        placeholder={baseInfo.example}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onBaseChange(baseInfo.base)}
                        disabled={isActive}
                      >
                        Set Active
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Format Options */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">
                Format Options
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  Group by 4 bits
                </Button>
                <Button variant="outline" size="sm">
                  Group by 8 bits
                </Button>
                <Button variant="outline" size="sm">
                  Uppercase HEX
                </Button>
                <Button variant="outline" size="sm">
                  Show Prefixes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Encoding Bases */}
          <TabsContent value="encoding" className="space-y-4">
            <div className="space-y-4">
              {encodingBases.map((encoding) => (
                <div
                  key={encoding.name}
                  className="p-4 rounded-lg border bg-muted/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">{encoding.name}</Label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        Encode
                      </Button>
                      <Button variant="ghost" size="sm">
                        Decode
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Input placeholder={encoding.example} className="font-mono" />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Custom Base */}
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="min-w-[4rem]">Base:</Label>
                <Input
                  type="number"
                  min="2"
                  max="36"
                  placeholder="2-36"
                  className="w-20"
                />
                <Button variant="outline">Convert</Button>
              </div>

              <div className="p-4 rounded-lg border bg-muted/20">
                <Label className="font-medium mb-2 block">
                  Custom Base Result
                </Label>
                <Input
                  placeholder="Result will appear here..."
                  className="font-mono"
                  readOnly
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Supports bases 2-36 using digits 0-9 and letters A-Z</p>
                <p>
                  Examples: Base 3 (0,1,2), Base 12 (0-9,A,B), Base 36 (0-9,A-Z)
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
