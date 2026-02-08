import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Typewriter,
  RippleSection,
} from '@/components/ui';
import { PALETTES } from '@/utils/color';

const POPULAR_FONTS = [
  'Roboto',
  'Roboto Condensed',
  'Montserrat',
  'Raleway',
  'Inter',
  'Outfit',
  'Bitter',
  'Libre Franklin',
];

export function TypographySection() {
  const [activeFont, setActiveFont] = useState('');

  const loadFont = async (font: string) => {
    if (!font) return;

    const formattedFont = font.split(' ').join('+');
    const url = `https://fonts.googleapis.com/css2?family=${formattedFont}:ital,wght@0,100..900;1,100..900&display=swap`;

    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setActiveFont(font);
  };

  return (
    <RippleSection
      className="bg-surface-variant py-24 text-on-surface-variant relative overflow-hidden"
      themes={['transparent', ...PALETTES.map((p) => p.color)]}
      style={activeFont ? { fontFamily: `"${activeFont}", sans-serif` } : {}}
    >
      <div className="container mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-on-secondary pb-2">
          <h2 className="text-2xl font-semibold">Typography</h2>
          <div className="flex flex-col gap-1 items-end">
            <div className="text-xs font-mono text-primary h-4">
              <Typewriter
                strings={[`Pick a font`]}
                typeSpeed={70}
                deleteSpeed={50}
                delayBetween={3000}
              />
            </div>
            <div className="w-48">
              <Select
                value={activeFont}
                onValueChange={(value) => {
                  loadFont(value);
                }}
              >
                <SelectTrigger className="h-10 bg-surface border-outline-variant">
                  <SelectValue placeholder="Popular Fonts" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
              Headings & Body
            </h3>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold">Heading 1</h1>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Text 4xl Bold
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold">Heading 2</h2>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Text 3xl Semibold
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-semibold">Heading 3</h3>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Text 2xl Semibold
                </p>
              </div>
              <div>
                <h4 className="text-xl font-medium">Heading 4</h4>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Text xl Medium
                </p>
              </div>
              <div>
                <p className="text-base leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Body Base Regular
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident.
                </p>
                <p className="text-sm text-on-surface-variant/70 mt-1">
                  Body Small Muted
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
              Weights & Styles
            </h3>
            <div className="space-y-4">
              <p className="font-thin">Thin Text (100)</p>
              <p className="font-light">Light Text (300)</p>
              <p className="font-normal">Normal Text (400)</p>
              <p className="font-medium">Medium Text (500)</p>
              <p className="font-semibold">Semibold Text (600)</p>
              <p className="font-bold">Bold Text (700)</p>
              <p className="font-extrabold">Extrabold Text (800)</p>
              <p className="font-black">Black Text (900)</p>
              <p className="italic">Italic Text</p>
              <p className="underline">Underline Text</p>
              <p className="line-through">Strikethrough Text</p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">
              Text Colors
            </h3>
            <div className="space-y-4 p-6 bg-surface rounded-lg border border-outline-variant">
              <p className="text-primary">Text Primary</p>
              <p className="text-secondary">Text Secondary</p>
              <p className="text-tertiary">Text Tertiary</p>
              <p className="text-error">Text Error</p>
              <p className="text-success">Text Success</p>
              <p className="text-warning">Text Warning</p>
              <p className="text-info">Text Info</p>
              <p className="text-on-surface">Text On Surface</p>
              <p className="text-on-surface-variant">Text On Surface Variant</p>
              <p className="text-muted-foreground">Text Muted Foreground</p>
            </div>
          </div>
        </div>
      </div>
    </RippleSection>
  );
}
