<script setup lang="ts">
import { X, Plus, Trash2, Download, Upload } from 'lucide-vue-next';
import type { Segment, WheelSettings } from '../types';

const props = defineProps<{
  isOpen: boolean;
  segments: Segment[];
  settings: WheelSettings;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:segments', segments: Segment[]): void;
  (e: 'update:settings', settings: WheelSettings): void;
}>();

const FONTS = [
  'Inter',
  'Montserrat',
  'Roboto',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'Pacifico',
  'Caveat',
  'Bebas Neue',
  'Cinzel',
  'Comic Neue'
];

const addSegment = () => {
  const newId = Math.random().toString(36).substr(2, 9);
  emit('update:segments', [...props.segments, { id: newId, text: 'Jauna sekcija', color: '#cccccc', textColor: '#000000', count: 10 }]);
};

const updateSegment = (id: string, field: keyof Segment, value: any) => {
  emit('update:segments', props.segments.map(s => s.id === id ? { ...s, [field]: value } : s));
};

const handleImageUpload = (id: string, file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      updateSegment(id, 'imageUrl', base64);
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const handleBackgroundUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      emit('update:settings', { ...props.settings, backgroundImageUrl: base64 });
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
};

const removeSegment = (id: string) => {
  if (props.segments.length <= 2) {
    alert('Ratam jābūt vismaz 2 sekcijām!');
    return;
  }
  emit('update:segments', props.segments.filter(s => s.id !== id));
};

const handleExport = () => {
  const data = {
    segments: props.segments,
    settings: props.settings,
    version: '1.0',
    exportDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `laimes-rats-iestatijumi-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const handleImport = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target?.result as string);
      if (json.segments && Array.isArray(json.segments) && json.settings) {
        emit('update:segments', json.segments);
        emit('update:settings', json.settings);
        alert('Iestatījumi veiksmīgi importēti!');
      } else {
        alert('Kļūda: Nederīgs faila formāts!');
      }
    } catch (err) {
      alert('Kļūda: Neizdevās nolasīt failu!');
    }
    target.value = '';
  };
  reader.readAsText(file);
};
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
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm" @click="emit('close')">
      <div class="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col" @click.stop>
        <div class="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 class="text-2xl font-bold text-gray-800">Iestatījumi</h2>
          <button @click="emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div class="p-6 space-y-8">
          <!-- Data Management -->
          <section class="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 class="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              Datu pārvaldība
            </h3>
            <div class="flex gap-3">
              <button
                @click="handleExport"
                class="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm"
              >
                <Download class="w-4 h-4" /> Eksportēt JSON
              </button>
              <label class="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm cursor-pointer">
                <Upload class="w-4 h-4" /> Importēt JSON
                <input
                  type="file"
                  accept=".json"
                  @change="handleImport"
                  class="hidden"
                />
              </label>
            </div>
            <p class="text-[10px] text-blue-600/70 mt-2 text-center">
              Saglabājiet vai ielādējiet rata konfigurāciju (tekstus, krāsas, attēlus).
            </p>
          </section>

          <!-- General Settings -->
          <section>
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Kopējie iestatījumi</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Centra teksts</label>
                <input
                  type="text"
                  :value="settings.centerText"
                  @input="e => emit('update:settings', { ...settings, centerText: (e.target as HTMLInputElement).value })"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Centra krāsa</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      :value="settings.centerColor"
                      @input="e => emit('update:settings', { ...settings, centerColor: (e.target as HTMLInputElement).value })"
                      class="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span class="text-sm text-gray-500 uppercase">{{ settings.centerColor }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Centra teksta krāsa</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      :value="settings.centerTextColor"
                      @input="e => emit('update:settings', { ...settings, centerTextColor: (e.target as HTMLInputElement).value })"
                      class="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span class="text-sm text-gray-500 uppercase">{{ settings.centerTextColor }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bultiņas krāsa</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      :value="settings.pointerColor"
                      @input="e => emit('update:settings', { ...settings, pointerColor: (e.target as HTMLInputElement).value })"
                      class="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span class="text-sm text-gray-500 uppercase">{{ settings.pointerColor }}</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Šrifts (Fonts)</label>
                  <select
                    :value="settings.fontFamily || 'Inter'"
                    @change="e => emit('update:settings', { ...settings, fontFamily: (e.target as HTMLSelectElement).value })"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :style="{ fontFamily: settings.fontFamily || 'Inter' }"
                  >
                    <option v-for="font in FONTS" :key="font" :value="font" :style="{ fontFamily: font }">
                      {{ font }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Griešanās ilgums (s)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    :value="settings.spinDuration"
                    @input="e => emit('update:settings', { ...settings, spinDuration: Number((e.target as HTMLInputElement).value) })"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div class="col-span-2">
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="soundEnabled"
                      :checked="settings.soundEnabled ?? true"
                      @change="e => emit('update:settings', { ...settings, soundEnabled: (e.target as HTMLInputElement).checked })"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <label for="soundEnabled" class="text-sm font-medium text-gray-800 cursor-pointer block">Ieslēgt skaņu</label>
                      <p class="text-xs text-gray-500">Atskaņot "klikšķa" skaņu, kad rats griežas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-gray-100">
                <label class="block text-sm font-medium text-gray-700 mb-1">Lapas fona attēls (Canva dizains)</label>
                <p class="text-xs text-gray-500 mb-2">Augšupielādējiet fonu. Rats tiks iecentrēts, atstājot vietu augšā jūsu tekstam.</p>
                <div v-if="settings.backgroundImageUrl" class="flex items-center gap-3 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <img :src="settings.backgroundImageUrl" alt="Background Preview" class="w-20 h-12 object-cover rounded" />
                  <button 
                    @click="emit('update:settings', { ...settings, backgroundImageUrl: undefined })"
                    class="text-sm text-red-500 hover:text-red-700 font-medium ml-auto px-2"
                  >
                    Noņemt fonu
                  </button>
                </div>
                <input
                  v-else
                  type="file"
                  accept="image/*"
                  @change="e => {
                    const target = e.target as HTMLInputElement;
                    if (target.files?.[0]) {
                      handleBackgroundUpload(target.files[0]);
                    }
                  }"
                  class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>
          </section>

          <!-- Segments -->
          <section>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Sekcijas ({{ segments.length }})</h3>
              <button
                @click="addSegment"
                class="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Plus class="w-4 h-4" /> Pievienot
              </button>
            </div>
            
            <div class="space-y-3">
              <div v-for="(segment, index) in segments" :key="segment.id" class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 relative group">
                <div class="absolute -left-2 -top-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {{ index + 1 }}
                </div>
                <button
                  @click="removeSegment(segment.id)"
                  class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  title="Dzēst sekciju"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                
                <div class="flex gap-3">
                  <div class="flex-[2]">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Teksts</label>
                    <input
                      type="text"
                      :value="segment.text"
                      @input="e => updateSegment(segment.id, 'text', (e.target as HTMLInputElement).value)"
                      class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Skaits</label>
                    <input
                      type="number"
                      min="0"
                      :value="segment.count"
                      @input="e => updateSegment(segment.id, 'count', parseInt((e.target as HTMLInputElement).value) || 0)"
                      class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div class="flex gap-4">
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Fona krāsa</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        :value="segment.color"
                        @input="e => updateSegment(segment.id, 'color', (e.target as HTMLInputElement).value)"
                        class="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span class="text-xs text-gray-500 uppercase">{{ segment.color }}</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Teksta krāsa</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="color"
                        :value="segment.textColor"
                        @input="e => updateSegment(segment.id, 'textColor', (e.target as HTMLInputElement).value)"
                        class="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span class="text-xs text-gray-500 uppercase">{{ segment.textColor }}</span>
                    </div>
                  </div>
                </div>

                <div class="pt-2 border-t border-gray-200">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Fona attēls (Canva dizains)</label>
                  <div v-if="segment.imageUrl" class="flex items-center gap-3 mt-1 bg-white p-2 rounded border border-gray-200">
                    <img :src="segment.imageUrl" alt="Preview" class="w-12 h-12 object-cover rounded" />
                    <button 
                      @click="updateSegment(segment.id, 'imageUrl', '')"
                      class="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Noņemt attēlu
                    </button>
                  </div>
                  <input
                    v-else
                    type="file"
                    accept="image/*"
                    @change="e => {
                      const target = e.target as HTMLInputElement;
                      if (target.files?.[0]) {
                        handleImageUpload(segment.id, target.files[0]);
                      }
                    }"
                    class="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div v-if="segment.imageUrl" class="pt-2 border-t border-gray-200">
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-xs font-medium text-gray-500">Attēla mērogs (Zoom)</label>
                    <div class="flex items-center gap-2">
                      <button 
                        v-if="(segment.imageZoom || 1) !== 1"
                        @click="updateSegment(segment.id, 'imageZoom', 1)"
                        class="text-[10px] text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Atiestatīt
                      </button>
                      <span class="text-[10px] text-gray-400">{{ Math.round((segment.imageZoom || 1) * 100) }}%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    :value="segment.imageZoom || 1"
                    @input="e => updateSegment(segment.id, 'imageZoom', parseFloat((e.target as HTMLInputElement).value))"
                    class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div class="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    :id="`hideText-${segment.id}`"
                    :checked="segment.hideText || false"
                    @change="e => updateSegment(segment.id, 'hideText', (e.target as HTMLInputElement).checked)"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label :for="`hideText-${segment.id}`" class="text-xs text-gray-600 cursor-pointer select-none">
                    Slēpt tekstu uz rata (ja attēlā jau ir teksts)
                  </label>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>
