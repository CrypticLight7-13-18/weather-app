'use client';

import { cn } from '@/lib/utils';
import { WeatherCode, getWeatherCondition } from '@/types/weather';
import { motion } from 'framer-motion';

interface WeatherIconProps {
  code: WeatherCode;
  isDay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 28,
  md: 44,
  lg: 64,
  xl: 88,
  '2xl': 128,
};

export function WeatherIcon({
  code,
  isDay = true,
  size = 'md',
  className,
}: WeatherIconProps) {
  const dimension = SIZE_MAP[size];
  const condition = getWeatherCondition(code, isDay);
  
  return (
    <div 
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: dimension, height: dimension }}
      aria-label={condition.label}
    >
      <AnimatedIcon code={code} isDay={isDay} size={dimension} />
    </div>
  );
}

export function WeatherIconHero({
  code,
  isDay = true,
  className,
}: Omit<WeatherIconProps, 'size'>) {
  const condition = getWeatherCondition(code, isDay);
  
  return (
    <div className={cn('relative w-32 h-32', className)}>
      {/* Ambient glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'absolute inset-0 rounded-full blur-2xl',
          getGlowColor(code, isDay)
        )}
      />
      
      {/* Floating animation container */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
        aria-label={condition.label}
      >
        <AnimatedIcon code={code} isDay={isDay} size={128} />
      </motion.div>
    </div>
  );
}

function AnimatedIcon({ code, isDay, size }: { code: WeatherCode; isDay: boolean; size: number }) {
  // Clear/Sunny
  if ([0, 1].includes(code)) {
    return isDay ? <SunnyIcon size={size} /> : <ClearNightIcon size={size} />;
  }
  // Partly cloudy
  if (code === 2) {
    return isDay ? <PartlyCloudyDayIcon size={size} /> : <PartlyCloudyNightIcon size={size} />;
  }
  // Overcast
  if (code === 3) {
    return <CloudyIcon size={size} />;
  }
  // Fog
  if ([45, 48].includes(code)) {
    return <FoggyIcon size={size} />;
  }
  // Drizzle
  if ([51, 53, 55, 56, 57].includes(code)) {
    return <DrizzleIcon size={size} />;
  }
  // Rain
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    const heavy = [65, 67, 82].includes(code);
    return <RainyIcon size={size} heavy={heavy} />;
  }
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <SnowyIcon size={size} />;
  }
  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return <ThunderIcon size={size} />;
  }
  
  return <CloudyIcon size={size} />;
}

// ========== SUNNY ==========
function SunnyIcon({ size }: { size: number }) {
  const scale = size / 100;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer rays glow */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.line
            key={i}
            x1="50" y1="8" x2="50" y2="18"
            stroke="url(#sunRayGradient)"
            strokeWidth={3 * scale}
            strokeLinecap="round"
            transform={`rotate(${i * 30} 50 50)`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </motion.g>
      
      {/* Sun core */}
      <motion.circle
        cx="50" cy="50" r="24"
        fill="url(#sunCoreGradient)"
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      />
      
      {/* Sun highlight */}
      <circle cx="42" cy="42" r="8" fill="white" opacity="0.3" />
      
      <defs>
        <linearGradient id="sunRayGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
        <radialGradient id="sunCoreGradient" cx="0.35" cy="0.35" r="0.65">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="40%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ========== CLEAR NIGHT ==========
function ClearNightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="moonGradient" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FEFCE8" />
          <stop offset="40%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
        <mask id="crescentMask">
          <rect width="100" height="100" fill="white" />
          <circle cx="58" cy="42" r="22" fill="black" />
        </mask>
      </defs>
      
      {/* Moon - proper crescent shape */}
      <motion.g
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '50px 50px' }}
      >
        <circle 
          cx="45" cy="50" r="26" 
          fill="url(#moonGradient)"
          mask="url(#crescentMask)"
        />
        {/* Moon surface details */}
        <circle cx="38" cy="42" r="3" fill="#FDE047" opacity="0.3" />
        <circle cx="42" cy="58" r="2" fill="#FDE047" opacity="0.25" />
        <circle cx="32" cy="52" r="1.5" fill="#FDE047" opacity="0.2" />
      </motion.g>
      
      {/* Stars */}
      {[
        { x: 75, y: 28, r: 2.5, delay: 0 },
        { x: 82, y: 45, r: 2, delay: 0.3 },
        { x: 70, y: 68, r: 1.5, delay: 0.6 },
        { x: 88, y: 62, r: 2, delay: 0.2 },
        { x: 78, y: 78, r: 1.5, delay: 0.5 },
        { x: 22, y: 25, r: 1.5, delay: 0.8 },
        { x: 15, y: 70, r: 2, delay: 0.4 },
        { x: 28, y: 82, r: 1, delay: 0.7 },
      ].map((star, i) => (
        <motion.g key={i}>
          <motion.circle
            cx={star.x} cy={star.y} r={star.r}
            fill="#FEF9C3"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: star.delay }}
            style={{ transformOrigin: `${star.x}px ${star.y}px` }}
          />
          {/* Star sparkle */}
          <motion.circle
            cx={star.x} cy={star.y} r={star.r * 1.5}
            fill="#FEF9C3"
            opacity={0.3}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: star.delay }}
            style={{ transformOrigin: `${star.x}px ${star.y}px` }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

// ========== PARTLY CLOUDY DAY ==========
function PartlyCloudyDayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Sun behind */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '72px 28px' }}
      >
        {[...Array(8)].map((_, i) => (
          <line
            key={i}
            x1="72" y1="10" x2="72" y2="16"
            stroke="#FCD34D"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${i * 45} 72 28)`}
          />
        ))}
      </motion.g>
      <circle cx="72" cy="28" r="14" fill="url(#partlySunGradient)" />
      
      {/* Cloud */}
      <motion.g
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M70 58C70 50 63 44 55 44C53 44 51 45 49 46C45 40 38 36 30 36C18 36 8 46 8 58C8 59 8 60 8 61C4 63 2 67 2 72C2 80 8 86 17 86H67C75 86 82 79 82 71C82 64 77 58 70 58Z"
          fill="url(#cloudGradientDay)"
        />
        {/* Cloud highlights */}
        <ellipse cx="30" cy="55" rx="12" ry="8" fill="white" opacity="0.4" />
        <ellipse cx="55" cy="60" rx="8" ry="5" fill="white" opacity="0.3" />
      </motion.g>
      
      <defs>
        <radialGradient id="partlySunGradient" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FBBF24" />
        </radialGradient>
        <linearGradient id="cloudGradientDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== PARTLY CLOUDY NIGHT ==========
function PartlyCloudyNightIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="partlyMoonGradient" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#FEFCE8" />
          <stop offset="40%" stopColor="#FEF9C3" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
        <linearGradient id="cloudGradientNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <mask id="partlyCrescentMask">
          <rect width="100" height="100" fill="white" />
          <circle cx="85" cy="22" r="14" fill="black" />
        </mask>
      </defs>
      
      {/* Moon - proper crescent shape */}
      <motion.g
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '72px 28px' }}
      >
        <circle 
          cx="72" cy="28" r="16" 
          fill="url(#partlyMoonGradient)"
          mask="url(#partlyCrescentMask)"
        />
        {/* Moon surface detail */}
        <circle cx="66" cy="24" r="2" fill="#FDE047" opacity="0.25" />
        <circle cx="68" cy="32" r="1.5" fill="#FDE047" opacity="0.2" />
      </motion.g>
      
      {/* Stars */}
      {[
        { x: 20, y: 18, r: 1.5 },
        { x: 35, y: 12, r: 1.5 },
        { x: 12, y: 32, r: 1 },
      ].map((star, i) => (
        <motion.circle
          key={i}
          cx={star.x} cy={star.y} r={star.r}
          fill="#FEF9C3"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      
      {/* Cloud */}
      <motion.g
        animate={{ x: [-2, 2, -2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M70 58C70 50 63 44 55 44C53 44 51 45 49 46C45 40 38 36 30 36C18 36 8 46 8 58C8 59 8 60 8 61C4 63 2 67 2 72C2 80 8 86 17 86H67C75 86 82 79 82 71C82 64 77 58 70 58Z"
          fill="url(#cloudGradientNight)"
        />
        {/* Cloud highlight */}
        <ellipse cx="30" cy="55" rx="10" ry="6" fill="white" opacity="0.15" />
      </motion.g>
    </svg>
  );
}

// ========== CLOUDY ==========
function CloudyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Back cloud */}
      <motion.path
        d="M78 42C78 34 71 28 63 28C61 28 59 29 57 30C53 24 46 20 38 20C26 20 16 30 16 42C16 43 16 44 16 45C12 47 10 51 10 56C10 64 16 70 25 70H75C83 70 90 63 90 55C90 48 85 43 78 43V42Z"
        fill="url(#cloudyBackGradient)"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Front cloud */}
      <motion.path
        d="M70 55C70 47 63 41 55 41C53 41 51 42 49 43C45 37 38 33 30 33C18 33 8 43 8 55C8 56 8 57 8 58C4 60 2 64 2 69C2 77 8 83 17 83H67C75 83 82 76 82 68C82 61 77 56 70 56V55Z"
        fill="url(#cloudyFrontGradient)"
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Highlights */}
      <ellipse cx="32" cy="52" rx="10" ry="6" fill="white" opacity="0.35" />
      <ellipse cx="52" cy="58" rx="7" ry="4" fill="white" opacity="0.25" />
      
      <defs>
        <linearGradient id="cloudyBackGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="cloudyFrontGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== RAINY ==========
function RainyIcon({ size, heavy }: { size: number; heavy: boolean }) {
  const drops = heavy 
    ? [18, 32, 46, 60, 74] 
    : [25, 50, 75];
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Cloud */}
      <motion.path
        d="M72 38C72 30 65 24 57 24C55 24 53 25 51 26C47 20 40 16 32 16C20 16 10 26 10 38C10 39 10 40 10 41C6 43 4 47 4 52C4 60 10 66 19 66H69C77 66 84 59 84 51C84 44 79 39 72 39V38Z"
        fill="url(#rainyCloudGradient)"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Rain drops */}
      {drops.map((x, i) => (
        <motion.g key={i}>
          <motion.path
            d={`M${x} 72 Q${x-2} 78 ${x} 82 Q${x+2} 78 ${x} 72`}
            fill="url(#rainDropGradient)"
            initial={{ y: -15, opacity: 0 }}
            animate={{ y: [0, 20], opacity: [1, 0] }}
            transition={{
              duration: heavy ? 0.6 : 0.9,
              repeat: Infinity,
              delay: i * (heavy ? 0.12 : 0.2),
              ease: 'easeIn',
            }}
          />
        </motion.g>
      ))}
      
      <defs>
        <linearGradient id="rainyCloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="rainDropGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== DRIZZLE ==========
function DrizzleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Cloud */}
      <motion.path
        d="M72 38C72 30 65 24 57 24C55 24 53 25 51 26C47 20 40 16 32 16C20 16 10 26 10 38C10 39 10 40 10 41C6 43 4 47 4 52C4 60 10 66 19 66H69C77 66 84 59 84 51C84 44 79 39 72 39V38Z"
        fill="url(#drizzleCloudGradient)"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Drizzle dots */}
      {[28, 44, 60].map((x, i) => (
        <motion.circle
          key={i}
          cx={x} cy="78" r="2.5"
          fill="#93C5FD"
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: [0, 15], opacity: [0.8, 0] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: 'easeIn',
          }}
        />
      ))}
      
      <defs>
        <linearGradient id="drizzleCloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== SNOWY ==========
function SnowyIcon({ size }: { size: number }) {
  const flakes = [
    { x: 22, delay: 0 },
    { x: 38, delay: 0.4 },
    { x: 54, delay: 0.2 },
    { x: 70, delay: 0.6 },
  ];
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Cloud */}
      <motion.path
        d="M72 32C72 24 65 18 57 18C55 18 53 19 51 20C47 14 40 10 32 10C20 10 10 20 10 32C10 33 10 34 10 35C6 37 4 41 4 46C4 54 10 60 19 60H69C77 60 84 53 84 45C84 38 79 33 72 33V32Z"
        fill="url(#snowyCloudGradient)"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Snowflakes */}
      {flakes.map((flake, i) => (
        <motion.g
          key={i}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 35], opacity: [1, 0], rotate: [0, 180] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: flake.delay,
            ease: 'linear',
          }}
          style={{ transformOrigin: `${flake.x}px 70px` }}
        >
          <SnowflakeSVG x={flake.x} y={70} />
        </motion.g>
      ))}
      
      <defs>
        <linearGradient id="snowyCloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SnowflakeSVG({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="-5" y1="0" x2="5" y2="0" stroke="#A5F3FC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="-5" x2="0" y2="5" stroke="#A5F3FC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
      <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#A5F3FC" strokeWidth="1" strokeLinecap="round" />
      <circle cx="0" cy="0" r="1.5" fill="#E0F2FE" />
    </g>
  );
}

// ========== THUNDER ==========
function ThunderIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Dark cloud */}
      <motion.path
        d="M72 32C72 24 65 18 57 18C55 18 53 19 51 20C47 14 40 10 32 10C20 10 10 20 10 32C10 33 10 34 10 35C6 37 4 41 4 46C4 54 10 60 19 60H69C77 60 84 53 84 45C84 38 79 33 72 33V32Z"
        fill="url(#thunderCloudGradient)"
        animate={{ x: [-1, 1, -1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Lightning */}
      <motion.path
        d="M52 55L42 72H50L44 92L62 70H53L52 55Z"
        fill="url(#lightningGradient)"
        animate={{ 
          opacity: [0, 1, 1, 0, 0, 0, 1, 1, 0],
          scale: [0.95, 1, 1, 0.95, 0.95, 0.95, 1, 1, 0.95],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          times: [0, 0.05, 0.15, 0.2, 0.4, 0.6, 0.65, 0.75, 1],
        }}
        style={{ transformOrigin: '50px 70px' }}
      />
      
      {/* Rain drops */}
      {[25, 72].map((x, i) => (
        <motion.path
          key={i}
          d={`M${x} 68 Q${x-2} 74 ${x} 78 Q${x+2} 74 ${x} 68`}
          fill="#60A5FA"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: [0, 18], opacity: [0.8, 0] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.35,
            ease: 'easeIn',
          }}
        />
      ))}
      
      <defs>
        <linearGradient id="thunderCloudGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="lightningGradient" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#FACC15" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========== FOGGY ==========
function FoggyIcon({ size }: { size: number }) {
  const layers = [
    { y: 25, w: 65, opacity: 0.9 },
    { y: 42, w: 55, opacity: 0.7 },
    { y: 59, w: 70, opacity: 0.5 },
    { y: 76, w: 50, opacity: 0.3 },
  ];
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {layers.map((layer, i) => (
        <motion.rect
          key={i}
          x={(100 - layer.w) / 2}
          y={layer.y}
          width={layer.w}
          height="10"
          rx="5"
          fill="#94A3B8"
          opacity={layer.opacity}
          animate={{ 
            x: i % 2 === 0 ? [0, 6, 0] : [0, -6, 0],
          }}
          transition={{ 
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

function getGlowColor(code: WeatherCode, isDay: boolean): string {
  if ([0, 1].includes(code)) {
    return isDay ? 'bg-amber-300/60' : 'bg-indigo-300/50';
  }
  if (code === 2) {
    return isDay ? 'bg-amber-200/40' : 'bg-indigo-200/30';
  }
  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return 'bg-blue-400/50';
  }
  if ([71, 73, 75, 85, 86].includes(code)) {
    return 'bg-cyan-200/50';
  }
  if ([95, 96, 99].includes(code)) {
    return 'bg-purple-400/60';
  }
  return 'bg-slate-300/40';
}
