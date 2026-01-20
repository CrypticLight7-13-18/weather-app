'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, Button, IconButton, Toggle, Switch, Skeleton } from '@/components/ui';
import { WeatherIcon, WeatherIconHero } from '@/components/weather';
import { WeatherCode } from '@/types/weather';
import { useTheme } from '@/hooks';
import { 
  Sun, Moon, Droplets,
  ChevronRight, Copy, Check, Home, Palette, Layers,
  Zap, Box, Settings, Star, MapPin,
  RefreshCw, Eye, AlertTriangle,
  CloudLightning, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Section = 'overview' | 'icons' | 'cards' | 'buttons' | 'toggles' | 'feedback' | 'colors' | 'animations';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  const sections = [
    { id: 'overview' as Section, label: 'Overview', icon: <Home className="h-4 w-4" /> },
    { id: 'icons' as Section, label: 'Weather Icons', icon: <Sun className="h-4 w-4" /> },
    { id: 'cards' as Section, label: 'Cards', icon: <Box className="h-4 w-4" /> },
    { id: 'buttons' as Section, label: 'Buttons', icon: <Zap className="h-4 w-4" /> },
    { id: 'toggles' as Section, label: 'Toggles', icon: <Layers className="h-4 w-4" /> },
    { id: 'feedback' as Section, label: 'Feedback', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'colors' as Section, label: 'Colors', icon: <Palette className="h-4 w-4" /> },
    { id: 'animations' as Section, label: 'Animations', icon: <RefreshCw className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#e8eef5] dark:bg-slate-900">
      <header className="sticky top-0 z-40 bg-[#e8eef5]/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span className="text-sm">Back to App</span>
            </Link>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">Component Documentation</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weather App Design System v1.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tests link */}
            <Link 
              href="/tests"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium',
                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                'hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
              )}
            >
              <FlaskConical className="h-4 w-4" />
              Tests
            </Link>
            
            {/* Theme toggle */}
            <IconButton
              label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onClick={toggleTheme}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ThemeIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </IconButton>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        <aside className="w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-4">Components</p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeSection === section.id
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(60,70,85,0.2)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === 'overview' && <OverviewSection />}
              {activeSection === 'icons' && <IconsSection copyCode={copyCode} copiedCode={copiedCode} />}
              {activeSection === 'cards' && <CardsSection copyCode={copyCode} copiedCode={copiedCode} />}
              {activeSection === 'buttons' && <ButtonsSection copyCode={copyCode} copiedCode={copiedCode} />}
              {activeSection === 'toggles' && <TogglesSection />}
              {activeSection === 'feedback' && <FeedbackSection />}
              {activeSection === 'colors' && <ColorsSection />}
              {activeSection === 'animations' && <AnimationsSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Weather App Design System</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-3xl">
          A comprehensive component library built with <strong>Next.js 14</strong>, <strong>TypeScript</strong>, 
          and <strong>Tailwind CSS</strong>. This design system implements <span className="text-blue-600 dark:text-blue-400">neumorphism</span> and 
          <span className="text-purple-600 dark:text-purple-400"> glassmorphism</span> for a modern, tactile feel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" glow="blue" padding="lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Neumorphism</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Soft UI that uses subtle shadows to create elements that appear to extrude from or press into the background.
              </p>
              <ul className="mt-3 text-xs text-slate-500 space-y-1">
                <li>• Light shadow on top-left</li>
                <li>• Dark shadow on bottom-right</li>
                <li>• Background matches element color</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card variant="default" glow="purple" padding="lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Glassmorphism</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Frosted glass effect using background blur and transparency. Creates depth through layering.
              </p>
              <ul className="mt-3 text-xs text-slate-500 space-y-1">
                <li>• Background blur (backdrop-filter)</li>
                <li>• Semi-transparent backgrounds</li>
                <li>• Subtle borders and highlights</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="glass" padding="lg">
        <CardHeader><CardTitle>Quick Start</CardTitle></CardHeader>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto">
{`import { Card, Button, Toggle } from '@/components/ui';
import { WeatherIcon, WeatherIconHero } from '@/components/weather';

export function WeatherCard() {
  return (
    <Card variant="default" padding="lg">
      <WeatherIconHero code={0} isDay={true} />
      <h2 className="text-4xl font-bold">24°C</h2>
      <Button variant="primary">View Details</Button>
    </Card>
  );
}`}
        </pre>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Tech Stack</CardTitle></CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Next.js 14+', desc: 'App Router' },
            { name: 'TypeScript', desc: 'Strict mode' },
            { name: 'Tailwind CSS', desc: 'v4' },
            { name: 'Framer Motion', desc: 'Animations' },
            { name: 'Zustand', desc: 'State management' },
            { name: 'Recharts', desc: 'Charts' },
            { name: 'Lucide', desc: 'Icons' },
            { name: 'date-fns', desc: 'Date utilities' },
          ].map((tech) => (
            <div key={tech.name} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50">
              <p className="font-medium text-slate-800 dark:text-white text-sm">{tech.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function IconsSection({ copyCode, copiedCode }: { copyCode: (c: string, id: string) => void; copiedCode: string | null }) {
  const weatherCodes = [
    { code: 0, label: 'Clear Sky', desc: 'Sunny day or clear night with stars' },
    { code: 2, label: 'Partly Cloudy', desc: 'Scattered clouds with visible sun/moon' },
    { code: 3, label: 'Overcast', desc: 'Full cloud coverage' },
    { code: 45, label: 'Fog', desc: 'Foggy/misty conditions' },
    { code: 51, label: 'Drizzle', desc: 'Light precipitation' },
    { code: 63, label: 'Rain', desc: 'Moderate rainfall' },
    { code: 65, label: 'Heavy Rain', desc: 'Intense precipitation' },
    { code: 73, label: 'Snow', desc: 'Snowfall with animated flakes' },
    { code: 95, label: 'Thunderstorm', desc: 'Thunder and lightning' },
  ];

  const sizes: Array<'sm' | 'md' | 'lg' | 'xl' | '2xl'> = ['sm', 'md', 'lg', 'xl', '2xl'];
  const sizePx = { sm: 28, md: 44, lg: 64, xl: 88, '2xl': 128 };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Weather Icons</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Custom-designed animated SVG icons for all weather conditions. Each icon includes smooth Framer Motion 
          animations and supports day/night variants.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Hero Icons (WeatherIconHero)</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Large animated icons for the main weather display. Includes ambient glow and floating animation.
          Use <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">WeatherIconHero</code> for hero sections.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
          {[0, 2, 63, 73, 95].map((code) => {
            const info = weatherCodes.find(w => w.code === code);
            return (
              <div key={code} className="flex flex-col items-center gap-3">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                  <WeatherIconHero code={code as WeatherCode} isDay={true} />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{info?.label}</span>
              </div>
            );
          })}
        </div>

        <CodeBlock code={`<WeatherIconHero code={0} isDay={true} />`} id="hero" copyCode={copyCode} copiedCode={copiedCode} />
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Day vs Night Variants</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Icons adapt to day/night. Set <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">isDay</code> prop.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[0, 2].map((code) => (
            <div key={code} className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <WeatherIcon code={code as WeatherCode} isDay={true} size="xl" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Day</p>
                  <p className="text-xs text-slate-500">isDay: true</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-slate-100 dark:from-indigo-900/20 dark:to-slate-800/50">
                <WeatherIcon code={code as WeatherCode} isDay={false} size="xl" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Night</p>
                  <p className="text-xs text-slate-500">isDay: false</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>All Weather Conditions</CardTitle></CardHeader>
        <div className="space-y-3">
          {weatherCodes.map((item) => (
            <div key={item.code} className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <div className="flex gap-3 shrink-0">
                <WeatherIcon code={item.code as WeatherCode} isDay={true} size="lg" />
                <WeatherIcon code={item.code as WeatherCode} isDay={false} size="lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-800 dark:text-white">{item.label}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">Code: {item.code}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Icon Sizes</CardTitle></CardHeader>
        <div className="flex items-end gap-6 flex-wrap mb-6">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <WeatherIcon code={0} isDay={true} size={size} />
              <span className="text-xs text-slate-500">{size} ({sizePx[size]}px)</span>
            </div>
          ))}
        </div>
        <CodeBlock 
          code={`<WeatherIcon code={0} isDay={true} size="sm" />  // 28px
<WeatherIcon code={0} isDay={true} size="md" />  // 44px (default)
<WeatherIcon code={0} isDay={true} size="lg" />  // 64px
<WeatherIcon code={0} isDay={true} size="xl" />  // 88px
<WeatherIcon code={0} isDay={true} size="2xl" /> // 128px`}
          id="sizes" 
          copyCode={copyCode} 
          copiedCode={copiedCode} 
        />
      </Card>

      <Card variant="glass" padding="lg">
        <CardHeader><CardTitle>Props Reference</CardTitle></CardHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Prop</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Default</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-3 px-4"><code className="text-blue-600">code</code></td>
              <td className="py-3 px-4 text-slate-500">number (0-99)</td>
              <td className="py-3 px-4 text-slate-400">required</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Open-Meteo weather code</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-3 px-4"><code className="text-blue-600">isDay</code></td>
              <td className="py-3 px-4 text-slate-500">boolean</td>
              <td className="py-3 px-4 text-slate-400">true</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Day or night variant</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-3 px-4"><code className="text-blue-600">size</code></td>
              <td className="py-3 px-4 text-slate-500">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos; | &apos;xl&apos; | &apos;2xl&apos;</td>
              <td className="py-3 px-4 text-slate-400">&apos;md&apos;</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">Icon size preset</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CardsSection({ copyCode, copiedCode }: { copyCode: (c: string, id: string) => void; copiedCode: string | null }) {
  const variants: Array<{ name: 'default' | 'glass' | 'gradient' | 'elevated' | 'neumorph' | 'neumorph-inset'; desc: string; usage: string }> = [
    { name: 'default', desc: 'Standard neumorphic card', usage: 'General content containers' },
    { name: 'glass', desc: 'Glassmorphic with backdrop blur', usage: 'Overlays, modals' },
    { name: 'gradient', desc: 'Glass with subtle gradient', usage: 'Featured content' },
    { name: 'elevated', desc: 'Enhanced depth and elevation', usage: 'Important content' },
    { name: 'neumorph', desc: 'Full neumorphic raised effect', usage: 'Interactive elements' },
    { name: 'neumorph-inset', desc: 'Pressed/inset effect', usage: 'Active states, inputs' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Cards</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Flexible container components with multiple style variants including neumorphism, glassmorphism, 
          hover effects, and ambient glow.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Card Variants</CardTitle></CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {variants.map((v) => (
            <Card key={v.name} variant={v.name} padding="md">
              <CardHeader><CardTitle>{v.name}</CardTitle></CardHeader>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{v.desc}</p>
              <p className="text-xs text-slate-500"><strong>Use for:</strong> {v.usage}</p>
            </Card>
          ))}
        </div>
        <CodeBlock
          code={`<Card variant="default">Content</Card>
<Card variant="glass">Content</Card>
<Card variant="gradient">Content</Card>
<Card variant="elevated">Content</Card>
<Card variant="neumorph">Content</Card>
<Card variant="neumorph-inset">Content</Card>`}
          id="card-variants"
          copyCode={copyCode}
          copiedCode={copiedCode}
        />
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Glow Effects</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Add ambient colored glow with the <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">glow</code> prop.
          Uses a radial gradient overlay that doesn&apos;t conflict with shadows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <Card variant="default" glow="blue" padding="lg">
            <div className="text-center">
              <Droplets className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 dark:text-white">Blue Glow</p>
              <p className="text-xs text-slate-500 mt-1">Water, humidity, rain</p>
            </div>
          </Card>
          <Card variant="default" glow="purple" padding="lg">
            <div className="text-center">
              <CloudLightning className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 dark:text-white">Purple Glow</p>
              <p className="text-xs text-slate-500 mt-1">Storms, alerts</p>
            </div>
          </Card>
          <Card variant="default" glow="amber" padding="lg">
            <div className="text-center">
              <Sun className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800 dark:text-white">Amber Glow</p>
              <p className="text-xs text-slate-500 mt-1">Sun, temperature</p>
            </div>
          </Card>
        </div>
        <CodeBlock
          code={`<Card variant="default" glow="blue">Blue</Card>
<Card variant="default" glow="purple">Purple</Card>
<Card variant="default" glow="amber">Amber</Card>`}
          id="card-glow"
          copyCode={copyCode}
          copiedCode={copiedCode}
        />
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Hover Effect</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Add <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">hover</code> prop for lift effect on interaction.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {(['default', 'glass', 'elevated'] as const).map((v) => (
            <Card key={v} variant={v} hover padding="md">
              <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                Hover me! <span className="text-xs text-slate-400">({v})</span>
              </p>
            </Card>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Padding Options</CardTitle></CardHeader>
        <div className="flex flex-wrap gap-4 mb-6">
          {(['none', 'sm', 'md', 'lg'] as const).map((pad) => (
            <Card key={pad} variant="glass" padding={pad}>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded text-center">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">padding=&quot;{pad}&quot;</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ButtonsSection({ copyCode, copiedCode }: { copyCode: (c: string, id: string) => void; copiedCode: string | null }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Buttons</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Interactive button components with neumorphic and glassmorphic styles.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Button Variants</CardTitle></CardHeader>
        <div className="space-y-4 mb-6">
          {[
            { variant: 'primary' as const, desc: 'Primary actions, CTAs', style: 'Blue gradient with glow' },
            { variant: 'secondary' as const, desc: 'Secondary actions', style: 'Neumorphic raised' },
            { variant: 'ghost' as const, desc: 'Tertiary actions', style: 'Transparent' },
            { variant: 'danger' as const, desc: 'Destructive actions', style: 'Red gradient' },
            { variant: 'glass' as const, desc: 'Floating actions', style: 'Glassmorphic' },
            { variant: 'neumorph' as const, desc: 'Soft UI buttons', style: 'Neumorphic' },
          ].map((item) => (
            <div key={item.variant} className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Button variant={item.variant} className="w-32">{item.variant}</Button>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.desc}</p>
                <p className="text-xs text-slate-500">{item.style}</p>
              </div>
            </div>
          ))}
        </div>
        <CodeBlock
          code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="glass">Glass</Button>
<Button variant="neumorph">Neumorph</Button>`}
          id="btn-variants"
          copyCode={copyCode}
          copiedCode={copiedCode}
        />
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Button Sizes</CardTitle></CardHeader>
        <div className="flex items-center gap-4 flex-wrap mb-6">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Icon Buttons</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Use <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">IconButton</code> for icon-only actions.
          The <code>label</code> prop provides tooltip and accessibility.
        </p>
        <div className="flex items-center gap-4 mb-6">
          {[
            { icon: RefreshCw, label: 'Refresh' },
            { icon: MapPin, label: 'Location' },
            { icon: Star, label: 'Favorite' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <IconButton label={label}><Icon className="h-5 w-5" /></IconButton>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
        <CodeBlock
          code={`<IconButton label="Refresh">
  <RefreshCw className="h-5 w-5" />
</IconButton>`}
          id="icon-btn"
          copyCode={copyCode}
          copiedCode={copiedCode}
        />
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Loading State</CardTitle></CardHeader>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="primary" loading>Loading...</Button>
          <Button variant="secondary" loading>Processing</Button>
        </div>
      </Card>
    </div>
  );
}

function TogglesSection() {
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Toggles</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Toggle components for switching between options or boolean states with neumorphic styling.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Option Toggle</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          For mutually exclusive options like units, themes, or view modes.
        </p>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600 dark:text-slate-400 w-28">Temperature:</span>
            <Toggle
              options={[{ value: 'celsius', label: '°C' }, { value: 'fahrenheit', label: '°F' }]}
              value={unit}
              onChange={setUnit}
            />
            <span className="text-xs text-slate-400">Selected: {unit}</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-600 dark:text-slate-400 w-28">Theme:</span>
            <Toggle
              options={[{ value: 'light', label: '☀️' }, { value: 'dark', label: '🌙' }, { value: 'system', label: '💻' }]}
              value="light"
              onChange={() => {}}
            />
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Switch Toggle</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Binary on/off toggle for boolean settings like notifications, auto-refresh, etc.
        </p>
        <div className="flex items-center gap-4">
          <Switch checked={checked} onChange={setChecked} />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Auto-refresh: <strong>{checked ? 'ON' : 'OFF'}</strong>
          </span>
        </div>
      </Card>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Feedback</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Components for loading states, errors, and empty states.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Loading Skeletons</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Visual placeholders while content loads. Prevents layout shift.
        </p>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Empty & Error States</CardTitle></CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
            <MapPin className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1">No location selected</h3>
            <p className="text-sm text-slate-500 mb-4">Search for a city or use your current location</p>
            <Button variant="primary" size="sm">Search Cities</Button>
          </div>
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
            <AlertTriangle className="h-12 w-12 text-red-300 dark:text-red-600 mx-auto mb-3" />
            <h3 className="font-medium text-red-700 dark:text-red-400 mb-1">Failed to load weather</h3>
            <p className="text-sm text-red-500 dark:text-red-400/80 mb-4">Check your connection</p>
            <Button variant="danger" size="sm">Retry</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ColorsSection() {
  const colors = [
    { name: 'Background', light: '#e8eef5', dark: '#1e293b' },
    { name: 'Primary', light: '#3B82F6', dark: '#60A5FA' },
    { name: 'Success', light: '#10B981', dark: '#34D399' },
    { name: 'Warning', light: '#F59E0B', dark: '#FBBF24' },
    { name: 'Danger', light: '#EF4444', dark: '#F87171' },
    { name: 'Sun/Clear', light: '#FBBF24', dark: '#FCD34D' },
    { name: 'Rain', light: '#3B82F6', dark: '#60A5FA' },
    { name: 'Snow', light: '#A5F3FC', dark: '#CFFAFE' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Colors</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          The complete color palette with light and dark mode variants.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Color Palette</CardTitle></CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colors.map((c) => (
            <div key={c.name} className="flex gap-3">
              <div className="flex flex-col gap-1">
                <div className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: c.light }} />
                <span className="text-[10px] text-slate-400 text-center">Light</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: c.dark }} />
                <span className="text-[10px] text-slate-400 text-center">Dark</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{c.name}</p>
                <p className="text-xs text-slate-500">{c.light}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Neumorphic Shadow System</CardTitle></CardHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Neumorphism uses two opposing shadows to create depth.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Raised</h4>
            <div className="p-8 rounded-2xl bg-[#e8eef5] dark:bg-slate-800 shadow-[6px_6px_12px_rgba(163,177,198,0.6),-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),-6px_-6px_12px_rgba(55,65,81,0.25)]">
              <p className="text-center text-slate-500 text-sm">Element appears raised</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Inset</h4>
            <div className="p-8 rounded-2xl bg-[#e8eef5] dark:bg-slate-800 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(60,70,85,0.2)]">
              <p className="text-center text-slate-500 text-sm">Element appears pressed</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AnimationsSection() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Animations</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
          Animation patterns using Framer Motion. Smooth, purposeful, and respects reduced motion preferences.
        </p>
      </div>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Entrance Animations</CardTitle></CardHeader>
        <Button variant="primary" onClick={() => setShow(!show)} className="mb-6">
          {show ? 'Reset' : 'Trigger Animations'}
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {show && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Fade Up</p>
                  <code className="text-xs text-slate-500">y: 20 → 0</code>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Scale In</p>
                  <code className="text-xs text-slate-500">scale: 0.9 → 1</code>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Slide In</p>
                  <code className="text-xs text-slate-500">x: -20 → 0</code>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <CardHeader><CardTitle>Interactive Animations</CardTitle></CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/30 cursor-pointer text-center">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Scale</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/30 cursor-pointer text-center">
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Lift</p>
          </motion.div>
          <motion.div whileHover={{ rotate: 5 }} className="p-4 rounded-xl bg-amber-100 dark:bg-amber-900/30 cursor-pointer text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Rotate</p>
          </motion.div>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-center">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Float</p>
          </motion.div>
        </div>
      </Card>
    </div>
  );
}

function CodeBlock({ code, id, copyCode, copiedCode }: { code: string; id: string; copyCode: (c: string, id: string) => void; copiedCode: string | null }) {
  return (
    <div className="relative mt-4">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm overflow-x-auto"><code>{code}</code></pre>
      <button onClick={() => copyCode(code, id)} className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors" title="Copy">
        {copiedCode === id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
      </button>
    </div>
  );
}

