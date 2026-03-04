<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { Settings as SettingsIcon } from 'lucide-vue-next';
import confetti from 'canvas-confetti';
import Wheel from './components/Wheel.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import WinnerModal from './components/WinnerModal.vue';
import type { Segment, WheelSettings } from './types';

const defaultSegments: Segment[] = [
  { id: '1', text: 'Atlaide 10%', color: '#FF5733', textColor: '#FFFFFF', count: 10 },
  { id: '2', text: 'Bez dāvanas', color: '#F0F0F0', textColor: '#333333', count: 999 },
  { id: '3', text: 'Bezmaksas piegāde', color: '#3357FF', textColor: '#FFFFFF', count: 5 },
  { id: '4', text: 'Dāvana', color: '#F333FF', textColor: '#FFFFFF', count: 2 },
  { id: '5', text: 'Atlaide 20%', color: '#FFB533', textColor: '#000000', count: 3 },
  { id: '6', text: 'Mēģini vēlreiz', color: '#33FFF3', textColor: '#000000', count: 999 },
];

const defaultSettings: WheelSettings = {
  centerText: 'GRIEZT',
  centerColor: '#FFFFFF',
  centerTextColor: '#111827',
  spinDuration: 5,
  pointerColor: '#EF4444',
  fontFamily: 'Inter',
  soundEnabled: true,
};

const segments = ref<Segment[]>(defaultSegments);
const settings = ref<WheelSettings>(defaultSettings);
const isSettingsOpen = ref(false);

const rotation = ref(0);
const isSpinning = ref(false);
const winner = ref<Segment | null>(null);

const activeSegments = computed(() => segments.value.filter(s => s.count > 0));

// Audio Context for ticking sound
let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
};

const playTick = () => {
  if (!settings.value.soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);

  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.04);
};

// Track rotation for ticks
let lastTickSegment = -1;
let rafId: number | null = null;

const trackRotation = () => {
  const wheel = document.getElementById('wheel-container');
  if (!wheel || !isSpinning.value) {
    if (rafId) cancelAnimationFrame(rafId);
    return;
  }

  const style = window.getComputedStyle(wheel);
  const matrix = new DOMMatrixReadOnly(style.transform);
  const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
  const normalizedAngle = (angle + 360) % 360;
  
  const segmentSize = 360 / activeSegments.value.length;
  const currentSegment = Math.floor(normalizedAngle / segmentSize);

  if (currentSegment !== lastTickSegment) {
    playTick();
    lastTickSegment = currentSegment;
  }

  rafId = requestAnimationFrame(trackRotation);
};

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId);
});

// Load from localStorage on mount
onMounted(() => {
  const savedSegments = localStorage.getItem('wheel_segments');
  const savedSettings = localStorage.getItem('wheel_settings');
  if (savedSegments) {
    const parsed = JSON.parse(savedSegments);
    segments.value = parsed.map((s: any) => ({ ...s, count: s.count ?? 10 }));
  }
  if (savedSettings) settings.value = JSON.parse(savedSettings);
});

// Save to localStorage on change
watch([segments, settings], () => {
  localStorage.setItem('wheel_segments', JSON.stringify(segments.value));
  localStorage.setItem('wheel_settings', JSON.stringify(settings.value));
}, { deep: true });

// Load Google Font dynamically
watch(() => settings.value.fontFamily, (font) => {
  const fontToLoad = font || 'Inter';
  const fontName = fontToLoad.replace(/ /g, '+');
  const linkId = `google-font-${fontName}`;
  
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600;700;900&display=swap`;
    document.head.appendChild(link);
  }
}, { immediate: true });

const handleSpin = () => {
  if (isSpinning.value || activeSegments.value.length === 0) return;
  
  isSpinning.value = true;
  winner.value = null;
  lastTickSegment = -1;
  trackRotation();

  // Calculate new rotation
  const spins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
  const randomDegree = Math.floor(Math.random() * 360);
  const newRotation = rotation.value + (spins * 360) + randomDegree;
  
  rotation.value = newRotation;

  // Calculate winner
  setTimeout(() => {
    const normalizedRotation = newRotation % 360;
    const pointerAngle = 270;
    // The angle on the original wheel that is currently under the pointer
    const originalAngleAtPointer = (360 + pointerAngle - normalizedRotation) % 360;
    
    const sliceAngle = 360 / activeSegments.value.length;
    const winningIndex = Math.floor(originalAngleAtPointer / sliceAngle);
    
    const winningSegment = activeSegments.value[winningIndex];
    winner.value = winningSegment;
    isSpinning.value = false;
    
    // Decrement count
    segments.value = segments.value.map(s => 
      s.id === winningSegment.id ? { ...s, count: Math.max(0, s.count - 1) } : s
    );
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [winningSegment.color, '#ffffff', '#000000']
    });
    
  }, settings.value.spinDuration * 1000);
};
</script>

<template>
  <div 
    class="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
    :style="{ 
      backgroundImage: settings.backgroundImageUrl ? `url(${settings.backgroundImageUrl})` : undefined,
      backgroundColor: settings.backgroundImageUrl ? 'transparent' : '#f9fafb',
      fontFamily: settings.fontFamily ? `&quot;${settings.fontFamily}&quot;, sans-serif` : '&quot;Inter&quot;, sans-serif'
    }"
  >
    <!-- Header -->
    <header class="p-4 flex justify-between items-center z-20 absolute top-0 left-0 right-0">
      <h1 :class="['text-xl font-bold tracking-tight', settings.backgroundImageUrl ? 'text-transparent select-none' : 'text-gray-800']">
        {{ settings.backgroundImageUrl ? '' : 'Laimes Rats' }}
      </h1>
      <button
        @click="isSettingsOpen = true"
        class="p-2 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full transition-colors flex items-center gap-2 shadow-sm"
      >
        <SettingsIcon class="w-5 h-5" />
        <span class="hidden sm:inline text-sm font-medium">Iestatījumi</span>
      </button>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-8 pt-24 pb-12 overflow-hidden">
      <div class="w-full max-w-3xl mt-auto">
        <Wheel
          :segments="activeSegments"
          :settings="settings"
          :rotation="rotation"
          :is-spinning="isSpinning"
          @spin="handleSpin"
        />
      </div>
    </main>

    <SettingsPanel
      :is-open="isSettingsOpen"
      @close="isSettingsOpen = false"
      :segments="segments"
      @update:segments="val => segments = val"
      :settings="settings"
      @update:settings="val => settings = val"
    />

    <WinnerModal
      :winner="winner"
      @close="winner = null"
    />
  </div>
</template>
