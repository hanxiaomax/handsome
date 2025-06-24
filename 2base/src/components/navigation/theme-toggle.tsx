import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, type ColorScheme } from '@/hooks/use-theme';

const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
  { value: 'default', label: 'Default', color: 'bg-primary' },
  { value: 'blue', label: 'Blue', color: 'bg-primary' },
  { value: 'green', label: 'Green', color: 'bg-secondary' },
  { value: 'purple', label: 'Purple', color: 'bg-accent' },
  { value: 'orange', label: 'Orange', color: 'bg-primary' },
  { value: 'red', label: 'Red', color: 'bg-primary' },
];

export function ThemeToggle() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();

  // Convert theme to boolean for switch (light = false, dark = true)
  const isDark = theme === 'dark';

  // Handle theme toggle
  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // Get current theme icon
  const ThemeIcon = isDark ? Moon : Sun;

  return (
    <div className="flex items-center gap-3">
      {/* Theme Mode Switch */}
      <div className="flex items-center gap-2">
        <ThemeIcon className="h-4 w-4 text-muted-foreground" />
        <Switch
          checked={isDark}
          onCheckedChange={handleThemeToggle}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        />
      </div>

      {/* Color Scheme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Toggle color scheme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {colorSchemes.map((scheme) => (
            <DropdownMenuItem
              key={scheme.value}
              onClick={() => setColorScheme(scheme.value)}
              className="flex items-center gap-2"
            >
              <div className={`h-4 w-4 rounded-full ${scheme.color}`} />
              <span>{scheme.label}</span>
              {colorScheme === scheme.value && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 