<script setup lang="ts">
import { X } from 'lucide-vue-next';
import type { Segment } from '../types';

defineProps<{
  winner: Segment | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="winner"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      @click="emit('close')"
    >
      <Transition
        appear
        enter-active-class="transition duration-300 ease-out delay-75"
        enter-from-class="opacity-0 scale-90 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-90 translate-y-4"
      >
        <div
          class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
          @click.stop
        >
          <div 
            class="absolute top-0 left-0 w-full h-3" 
            :style="{ backgroundColor: winner.color }"
          />
          
          <button 
            @click="emit('close')"
            class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X class="w-5 h-5" />
          </button>

          <h2 class="text-2xl font-bold text-gray-800 mb-2 mt-4">Apsveicam!</h2>
          <p class="text-gray-500 mb-6">Jūs laimējāt:</p>
          
          <div 
            class="py-6 px-4 rounded-2xl mb-8 shadow-inner"
            :style="{ backgroundColor: winner.color, color: winner.textColor }"
          >
            <span class="text-3xl font-black tracking-tight">{{ winner.text }}</span>
          </div>
          
          <button
            @click="emit('close')"
            class="w-full py-3 px-6 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Turpināt
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
