import { useState, useCallback, useMemo, useEffect } from 'react';
import { ToolWrapper } from '@/components/common/tool-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Copy, 
  Shuffle, 
  Palette, 
  History,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import { toolInfo } from './toolInfo';
import { ColorPaletteEngine, type ColorValue, type ColorPalette } from './lib';

const engine = new ColorPaletteEngine();

export default function ColorPalette() {

  // Main state
  const [currentColor, setCurrentColor] = useState<ColorValue>(() => 
    engine.createColor('#3B82F6') // Default blue color
  );
  const [selectedFormat, setSelectedFormat] = useState<'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk'>('hex');
  const [generatedPalette, setGeneratedPalette] = useState<ColorPalette | null>(null);
  const [colorHistory, setColorHistory] = useState<ColorValue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Color picker state
  const [hueValue, setHueValue] = useState([currentColor.hsl.h]);
  const [saturationValue, setSaturationValue] = useState([currentColor.hsl.s]);
  const [lightnessValue, setLightnessValue] = useState([currentColor.hsl.l]);

  // Manual input state
  const [manualInput, setManualInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    setColorHistory(engine.getColorHistory());
    generatePalette(currentColor);
  }, []);

  // Update color from HSL sliders
  const updateColorFromHSL = useCallback((h: number, s: number, l: number) => {
    try {
      const newColor = engine.createColor({ h, s, l });
      setCurrentColor(newColor);
      setError(null);
    } catch {
      setError('Invalid color values');
    }
  }, []);

  // Handle slider changes
  const handleHueChange = useCallback((value: number[]) => {
    setHueValue(value);
    updateColorFromHSL(value[0], saturationValue[0], lightnessValue[0]);
  }, [saturationValue, lightnessValue, updateColorFromHSL]);

  const handleSaturationChange = useCallback((value: number[]) => {
    setSaturationValue(value);
    updateColorFromHSL(hueValue[0], value[0], lightnessValue[0]);
  }, [hueValue, lightnessValue, updateColorFromHSL]);

  const handleLightnessChange = useCallback((value: number[]) => {
    setLightnessValue(value);
    updateColorFromHSL(hueValue[0], saturationValue[0], value[0]);
  }, [hueValue, saturationValue, updateColorFromHSL]);

  // Update sliders when color changes
  useEffect(() => {
    setHueValue([currentColor.hsl.h]);
    setSaturationValue([currentColor.hsl.s]);
    setLightnessValue([currentColor.hsl.l]);
  }, [currentColor]);

  // Generate palette
  const generatePalette = useCallback((baseColor: ColorValue) => {
    setIsLoading(true);
    try {
      const palette = engine.generatePalette(baseColor, {
        tintsCount: 5,
        shadesCount: 5,
        includeHarmony: true,
        harmonyType: 'complementary'
      });
      setGeneratedPalette(palette);
      setColorHistory(engine.getColorHistory());
    } catch {
      setError('Failed to generate palette');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle manual input
  const handleManualInput = useCallback(() => {
    if (!manualInput.trim()) return;

    const validation = engine.validateColorInput(selectedFormat, manualInput);
    if (!validation.isValid) {
      setInputError(validation.error || 'Invalid color format');
      return;
    }

    try {
      let newColor: ColorValue;
      
      if (selectedFormat === 'hex') {
        newColor = engine.createColor(manualInput);
      } else if (selectedFormat === 'rgb') {
        const rgbMatch = manualInput.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          newColor = engine.createColor({ r, g, b });
        } else {
          throw new Error('Invalid RGB format');
        }
      } else if (selectedFormat === 'hsl') {
        const hslMatch = manualInput.match(/hsl\((\d+)°?,\s*(\d+)%?,\s*(\d+)%?\)/);
        if (hslMatch) {
          const [, h, s, l] = hslMatch.map(Number);
          newColor = engine.createColor({ h, s, l });
        } else {
          throw new Error('Invalid HSL format');
        }
      } else {
        throw new Error('Unsupported format for manual input');
      }

      setCurrentColor(newColor);
      generatePalette(newColor);
      setInputError(null);
      setManualInput('');
      toast.success('Color updated successfully');
    } catch (err) {
      setInputError(err instanceof Error ? err.message : 'Invalid color input');
    }
  }, [manualInput, selectedFormat, generatePalette]);

  // Copy color value
  const copyColorValue = useCallback(async (color: ColorValue, format: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk') => {
    const value = engine.formatColor(color, format);
    const success = await engine.copyToClipboard(value);
    if (success) {
      toast.success(`Copied ${value}`);
    } else {
      toast.error('Failed to copy');
    }
  }, []);

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const randomColor = engine.generateRandomColor();
    setCurrentColor(randomColor);
    generatePalette(randomColor);
    toast.success('Generated random color');
  }, [generatePalette]);

  // Select color from history or palette
  const selectColor = useCallback((color: ColorValue) => {
    setCurrentColor(color);
    generatePalette(color);
  }, [generatePalette]);

  // Contrast information
  const contrastInfo = useMemo(() => {
    const white = engine.createColor('#FFFFFF');
    const black = engine.createColor('#000000');
    return {
      onWhite: engine.checkContrast(currentColor, white),
      onBlack: engine.checkContrast(currentColor, black)
    };
  }, [currentColor]);



  return (
    <TooltipProvider>
      <ToolWrapper toolInfo={toolInfo} state={{ currentColor, generatedPalette, colorHistory }}>
      
        <div className="w-full p-6 space-y-6 mt-5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Color Picker Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Picker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Color Preview */}
                <div className="space-y-2">
                  <Label>Current Color</Label>
                  <div
                    className="w-full h-16 rounded-lg border-2 border-border cursor-pointer transition-transform hover:scale-105"
                    style={{ backgroundColor: currentColor.hex }}
                    onClick={() => copyColorValue(currentColor, 'hex')}
                  />
                  <p className="text-sm text-center text-muted-foreground">
                    Click to copy HEX
                  </p>
                </div>

                {/* HSL Sliders */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hue: {Math.round(hueValue[0])}°</Label>
                    <Slider
                      value={hueValue}
                      onValueChange={handleHueChange}
                      max={360}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Saturation: {Math.round(saturationValue[0])}%</Label>
                    <Slider
                      value={saturationValue}
                      onValueChange={handleSaturationChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lightness: {Math.round(lightnessValue[0])}%</Label>
                    <Slider
                      value={lightnessValue}
                      onValueChange={handleLightnessChange}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Manual Input */}
                <div className="space-y-2">
                  <Label>Manual Input</Label>
                  <div className="flex gap-2">
                    <Select value={selectedFormat} onValueChange={(value: 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk') => setSelectedFormat(value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">HEX</SelectItem>
                        <SelectItem value="rgb">RGB</SelectItem>
                        <SelectItem value="hsl">HSL</SelectItem>
                        <SelectItem value="hsv">HSV</SelectItem>
                        <SelectItem value="cmyk">CMYK</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder={`Enter ${selectedFormat.toUpperCase()} value`}
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleManualInput()}
                    />
                    <Button onClick={handleManualInput} size="sm">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  {inputError && (
                    <p className="text-sm text-destructive">{inputError}</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button onClick={generateRandomColor} variant="outline" size="sm" className="flex-1">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Random
                  </Button>
                  <Button onClick={() => generatePalette(currentColor)} variant="outline" size="sm" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {/* Color History */}
                {colorHistory.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Recent Colors
                    </Label>
                    <div className="grid grid-cols-8 gap-1">
                      {colorHistory.slice(0, 16).map((color, index) => (
                        <Tooltip key={`${color.hex}-${index}`}>
                          <TooltipTrigger asChild>
                            <div
                              className="w-6 h-6 rounded cursor-pointer border border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.hex }}
                              onClick={() => selectColor(color)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{color.hex}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Format Display Section */}
            <Card>
              <CardHeader>
                <CardTitle>Color Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* All Format Values */}
                <div className="space-y-3">
                  {[
                    { format: 'hex' as const, label: 'HEX', value: currentColor.hex },
                    { format: 'rgb' as const, label: 'RGB', value: `rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})` },
                    { format: 'hsl' as const, label: 'HSL', value: `hsl(${currentColor.hsl.h}°, ${currentColor.hsl.s}%, ${currentColor.hsl.l}%)` },
                    { format: 'hsv' as const, label: 'HSV', value: `hsv(${currentColor.hsv.h}°, ${currentColor.hsv.s}%, ${currentColor.hsv.v}%)` },
                    { format: 'cmyk' as const, label: 'CMYK', value: `cmyk(${currentColor.cmyk.c}%, ${currentColor.cmyk.m}%, ${currentColor.cmyk.y}%, ${currentColor.cmyk.k}%)` },
                  ].map(({ format, label, value }) => (
                    <div key={format} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex-1">
                        <Badge variant="secondary" className="mb-1">{label}</Badge>
                        <p className="text-sm font-mono">{value}</p>
                      </div>
                      <Button
                        onClick={() => copyColorValue(currentColor, format)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Contrast Information */}
                <div className="space-y-2">
                  <Label>Accessibility</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>On White</span>
                      <Badge variant={contrastInfo.onWhite.level === 'fail' ? 'destructive' : 'default'}>
                        {contrastInfo.onWhite.ratio.toFixed(1)}:1 {contrastInfo.onWhite.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <span>On Black</span>
                      <Badge variant={contrastInfo.onBlack.level === 'fail' ? 'destructive' : 'default'}>
                        {contrastInfo.onBlack.ratio.toFixed(1)}:1 {contrastInfo.onBlack.level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Palette Section */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : generatedPalette ? (
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {/* Base Color */}
                      <div className="space-y-2">
                        <Label>Base Color</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="w-full h-12 rounded cursor-pointer border transition-transform hover:scale-105"
                              style={{ backgroundColor: generatedPalette.baseColor.hex }}
                              onClick={() => selectColor(generatedPalette.baseColor)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{generatedPalette.baseColor.hex}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Tints */}
                      <div className="space-y-2">
                        <Label>Tints (Lighter)</Label>
                        <div className="grid grid-cols-5 gap-1">
                          {generatedPalette.tints.map((tint, index) => (
                            <Tooltip key={`tint-${index}`}>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-full h-8 rounded cursor-pointer border transition-transform hover:scale-110"
                                  style={{ backgroundColor: tint.hex }}
                                  onClick={() => selectColor(tint)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tint.hex}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      {/* Shades */}
                      <div className="space-y-2">
                        <Label>Shades (Darker)</Label>
                        <div className="grid grid-cols-5 gap-1">
                          {generatedPalette.shades.map((shade, index) => (
                            <Tooltip key={`shade-${index}`}>
                              <TooltipTrigger asChild>
                                <div
                                  className="w-full h-8 rounded cursor-pointer border transition-transform hover:scale-110"
                                  style={{ backgroundColor: shade.hex }}
                                  onClick={() => selectColor(shade)}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{shade.hex}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      {/* Harmony Colors */}
                      {generatedPalette.harmony && generatedPalette.harmony.length > 0 && (
                        <div className="space-y-2">
                          <Label>Harmony Colors</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {generatedPalette.harmony.map((color, index) => (
                              <Tooltip key={`harmony-${index}`}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="w-full h-12 rounded cursor-pointer border transition-transform hover:scale-105"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() => selectColor(color)}
                                  />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{color.hex}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p>Generate a palette to see colors here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ToolWrapper>
    </TooltipProvider>
  );
} 