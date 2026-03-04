import React from 'react';
import { Segment, WheelSettings } from '../types';
import { X, Plus, Trash2, Download, Upload } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  settings: WheelSettings;
  setSettings: React.Dispatch<React.SetStateAction<WheelSettings>>;
}

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

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen, onClose, segments, setSegments, settings, setSettings
}) => {
  if (!isOpen) return null;

  const addSegment = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setSegments([...segments, { id: newId, text: 'Jauna sekcija', color: '#cccccc', textColor: '#000000', count: 10 }]);
  };

  const updateSegment = (id: string, field: keyof Segment, value: any) => {
    setSegments(segments.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800; // Optimal size for a slice
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
        setSettings({ ...settings, backgroundImageUrl: base64 });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) {
      alert('Ratam jābūt vismaz 2 sekcijām!');
      return;
    }
    setSegments(segments.filter(s => s.id !== id));
  };

  const handleExport = () => {
    const data = {
      segments,
      settings,
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.segments && Array.isArray(json.segments) && json.settings) {
          setSegments(json.segments);
          setSettings(json.settings);
          alert('Iestatījumi veiksmīgi importēti!');
        } else {
          alert('Kļūda: Nederīgs faila formāts!');
        }
      } catch (err) {
        alert('Kļūda: Neizdevās nolasīt failu!');
      }
      // Reset input
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end backdrop-blur-sm">
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Iestatījumi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Data Management */}
          <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              Datu pārvaldība
            </h3>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm"
              >
                <Download className="w-4 h-4" /> Eksportēt JSON
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 bg-white text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-sm cursor-pointer">
                <Upload className="w-4 h-4" /> Importēt JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[10px] text-blue-600/70 mt-2 text-center">
              Saglabājiet vai ielādējiet rata konfigurāciju (tekstus, krāsas, attēlus).
            </p>
          </section>

          {/* General Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kopējie iestatījumi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centra teksts</label>
                <input
                  type="text"
                  value={settings.centerText}
                  onChange={(e) => setSettings({ ...settings, centerText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Centra krāsa</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.centerColor}
                      onChange={(e) => setSettings({ ...settings, centerColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm text-gray-500 uppercase">{settings.centerColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Centra teksta krāsa</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.centerTextColor}
                      onChange={(e) => setSettings({ ...settings, centerTextColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm text-gray-500 uppercase">{settings.centerTextColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bultiņas krāsa</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.pointerColor}
                      onChange={(e) => setSettings({ ...settings, pointerColor: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-sm text-gray-500 uppercase">{settings.pointerColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Šrifts (Fonts)</label>
                  <select
                    value={settings.fontFamily || 'Inter'}
                    onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{ fontFamily: settings.fontFamily || 'Inter' }}
                  >
                    {FONTS.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Griešanās ilgums (s)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.spinDuration}
                    onChange={(e) => setSettings({ ...settings, spinDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lapas fona attēls (Canva dizains)</label>
                <p className="text-xs text-gray-500 mb-2">Augšupielādējiet fonu. Rats tiks iecentrēts, atstājot vietu augšā jūsu tekstam.</p>
                {settings.backgroundImageUrl ? (
                  <div className="flex items-center gap-3 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <img src={settings.backgroundImageUrl} alt="Background Preview" className="w-20 h-12 object-cover rounded" />
                    <button 
                      onClick={() => setSettings({ ...settings, backgroundImageUrl: undefined })}
                      className="text-sm text-red-500 hover:text-red-700 font-medium ml-auto px-2"
                    >
                      Noņemt fonu
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleBackgroundUpload(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Segments */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Sekcijas ({segments.length})</h3>
              <button
                onClick={addSegment}
                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> Pievienot
              </button>
            </div>
            
            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div key={segment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3 relative group">
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Dzēst sekciju"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex gap-3">
                    <div className="flex-[2]">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Teksts</label>
                      <input
                        type="text"
                        value={segment.text}
                        onChange={(e) => updateSegment(segment.id, 'text', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Skaits</label>
                      <input
                        type="number"
                        min="0"
                        value={segment.count}
                        onChange={(e) => updateSegment(segment.id, 'count', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Fona krāsa</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={segment.color}
                          onChange={(e) => updateSegment(segment.id, 'color', e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 uppercase">{segment.color}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Teksta krāsa</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={segment.textColor}
                          onChange={(e) => updateSegment(segment.id, 'textColor', e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 uppercase">{segment.textColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fona attēls (Canva dizains)</label>
                    {segment.imageUrl ? (
                      <div className="flex items-center gap-3 mt-1 bg-white p-2 rounded border border-gray-200">
                        <img src={segment.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        <button 
                          onClick={() => updateSegment(segment.id, 'imageUrl', '')}
                          className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                          Noņemt attēlu
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(segment.id, e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id={`hideText-${segment.id}`}
                      checked={segment.hideText || false}
                      onChange={(e) => updateSegment(segment.id, 'hideText', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor={`hideText-${segment.id}`} className="text-xs text-gray-600 cursor-pointer select-none">
                      Slēpt tekstu uz rata (ja attēlā jau ir teksts)
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
