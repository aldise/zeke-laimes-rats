import React from 'react';
import { motion } from 'motion/react';
import { Segment, WheelSettings } from '../types';

interface WheelProps {
  segments: Segment[];
  settings: WheelSettings;
  rotation: number;
  isSpinning: boolean;
  onSpin: () => void;
}

export const Wheel: React.FC<WheelProps> = ({ segments, settings, rotation, isSpinning, onSpin }) => {
  if (segments.length === 0) {
    return (
      <div className="relative w-full max-w-2xl aspect-square mx-auto flex items-center justify-center bg-gray-200 rounded-full shadow-inner border-8 border-white/20">
        <p className="text-2xl font-bold text-gray-500">Visi laimesti izdalīti!</p>
      </div>
    );
  }

  const radius = 480;
  const center = 500;
  const sliceAngle = 360 / segments.length;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const createSlicePath = (angle: number, r: number) => {
    const startAngle = -angle / 2;
    const endAngle = angle / 2;
    const start = polarToCartesian(0, 0, r, startAngle);
    const end = polarToCartesian(0, 0, r, endAngle);
    const largeArcFlag = angle <= 180 ? "0" : "1";
    return [
      "M", 0, 0,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const slicePath = createSlicePath(sliceAngle, radius);

  return (
    <div className="relative w-full max-w-2xl aspect-square mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 drop-shadow-lg">
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 80L0 20C0 8.95431 8.95431 0 20 0H40C51.0457 0 60 8.95431 60 20L30 80Z" fill={settings.pointerColor} />
        </svg>
      </div>

      {/* Wheel */}
      <motion.div
        className="w-full h-full rounded-full shadow-2xl overflow-hidden border-8 border-white/20"
        animate={{ rotate: rotation }}
        transition={{ duration: settings.spinDuration, ease: [0.2, 0.8, 0.1, 1] }}
        style={{ transformOrigin: 'center center' }}
      >
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <defs>
            <clipPath id="slice-clip">
              <path d={slicePath} />
            </clipPath>
          </defs>
          
          {segments.map((segment, index) => {
            const groupRotation = index * sliceAngle + sliceAngle / 2;

            return (
              <g key={segment.id} transform={`translate(${center}, ${center}) rotate(${groupRotation})`}>
                <path
                  d={slicePath}
                  fill={segment.color}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                
                {segment.imageUrl && (
                  <image
                    href={segment.imageUrl}
                    clipPath="url(#slice-clip)"
                    x={0}
                    y={-radius}
                    width={radius}
                    height={radius * 2}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}

                {!segment.hideText && (
                  <text
                    x={radius * 0.6}
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={segment.textColor}
                    fontSize="36"
                    fontWeight="bold"
                    fontFamily={settings.fontFamily ? `"${settings.fontFamily}", sans-serif` : '"Inter", sans-serif'}
                    className="drop-shadow-md"
                  >
                    {segment.text}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center Circle */}
          <circle cx={center} cy={center} r="120" fill={settings.centerColor} stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={settings.centerTextColor}
            fontSize="48"
            fontWeight="900"
            fontFamily={settings.fontFamily ? `"${settings.fontFamily}", sans-serif` : '"Inter", sans-serif'}
            className="cursor-pointer select-none drop-shadow-lg"
          >
            {settings.centerText}
          </text>
        </svg>
      </motion.div>

      {/* Center Button Overlay for better clickability */}
      <button
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24%] h-[24%] rounded-full z-10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50"
        onClick={!isSpinning ? onSpin : undefined}
        disabled={isSpinning}
        aria-label="Griezt ratu"
      />
    </div>
  );
};
