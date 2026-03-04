<script setup lang="ts">
import { computed } from 'vue';
import type { Segment, WheelSettings } from '../types';

const props = defineProps<{
  segments: Segment[];
  settings: WheelSettings;
  rotation: number;
  isSpinning: boolean;
}>();

const emit = defineEmits<{
  (e: 'spin'): void;
}>();

const radius = 480;
const center = 500;
const sliceAngle = computed(() => 360 / props.segments.length);

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

const slicePath = computed(() => createSlicePath(sliceAngle.value, radius));

const wheelStyle = computed(() => ({
  transform: `rotate(${props.rotation}deg)`,
  transition: `transform ${props.settings.spinDuration}s cubic-bezier(0.2, 0.8, 0.1, 1)`,
  transformOrigin: 'center center'
}));
</script>

<template>
  <div v-if="segments.length === 0" class="relative w-full max-w-2xl aspect-square mx-auto flex items-center justify-center bg-gray-200 rounded-full shadow-inner border-8 border-white/20">
    <p class="text-2xl font-bold text-gray-500">Visi laimesti izdalīti!</p>
  </div>

  <div v-else class="relative w-full max-w-2xl aspect-square mx-auto">
    <!-- Pointer -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 drop-shadow-lg">
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 80L0 20C0 8.95431 8.95431 0 20 0H40C51.0457 0 60 8.95431 60 20L30 80Z" :fill="settings.pointerColor" />
      </svg>
    </div>

    <!-- Wheel -->
    <div
      class="w-full h-full rounded-full shadow-2xl overflow-hidden border-8 border-white/20"
      :style="wheelStyle"
    >
      <svg viewBox="0 0 1000 1000" class="w-full h-full">
        <defs>
          <clipPath id="slice-clip">
            <path :d="slicePath" />
          </clipPath>
        </defs>
        
        <g v-for="(segment, index) in segments" :key="segment.id" :transform="`translate(${center}, ${center}) rotate(${index * sliceAngle + sliceAngle / 2})`">
          <path
            :d="slicePath"
            :fill="segment.color"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="2"
          />
          
          <image
            v-if="segment.imageUrl"
            :href="segment.imageUrl"
            clip-path="url(#slice-clip)"
            :x="radius * 0.6 - (radius * 0.4 * (segment.imageZoom || 1) / 2)"
            :y="-(radius * 0.4 * (segment.imageZoom || 1) / 2)"
            :width="radius * 0.4 * (segment.imageZoom || 1)"
            :height="radius * 0.4 * (segment.imageZoom || 1)"
            preserveAspectRatio="xMidYMid meet"
          />

          <text
            v-if="!segment.hideText"
            :x="radius * 0.6"
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            :fill="segment.textColor"
            font-size="36"
            font-weight="bold"
            :font-family="settings.fontFamily ? `&quot;${settings.fontFamily}&quot;, sans-serif` : '&quot;Inter&quot;, sans-serif'"
            class="drop-shadow-md"
          >
            {{ segment.text }}
          </text>
        </g>
        
        <!-- Center Circle -->
        <circle :cx="center" :cy="center" r="120" :fill="settings.centerColor" stroke="rgba(255,255,255,0.3)" stroke-width="8" />
        <text
          :x="center"
          :y="center"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="settings.centerTextColor"
          font-size="48"
          font-weight="900"
          :font-family="settings.fontFamily ? `&quot;${settings.fontFamily}&quot;, sans-serif` : '&quot;Inter&quot;, sans-serif'"
          class="cursor-pointer select-none drop-shadow-lg"
        >
          {{ settings.centerText }}
        </text>
      </svg>
    </div>

    <!-- Center Button Overlay for better clickability -->
    <button
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24%] h-[24%] rounded-full z-10 cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/50"
      @click="!isSpinning ? emit('spin') : undefined"
      :disabled="isSpinning"
      aria-label="Griezt ratu"
    />
  </div>
</template>
