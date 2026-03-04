import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Wheel } from './components/Wheel';
import { SettingsPanel } from './components/SettingsPanel';
import { WinnerModal } from './components/WinnerModal';
import { Segment, WheelSettings } from './types';

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
};

export default function App() {
  const [segments, setSegments] = useState<Segment[]>(defaultSegments);
  const [settings, setSettings] = useState<WheelSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Segment | null>(null);

  const activeSegments = segments.filter(s => s.count > 0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSegments = localStorage.getItem('wheel_segments');
    const savedSettings = localStorage.getItem('wheel_settings');
    if (savedSegments) {
      const parsed = JSON.parse(savedSegments);
      setSegments(parsed.map((s: any) => ({ ...s, count: s.count ?? 10 })));
    }
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('wheel_segments', JSON.stringify(segments));
    localStorage.setItem('wheel_settings', JSON.stringify(settings));
  }, [segments, settings]);

  // Load Google Font dynamically
  useEffect(() => {
    const font = settings.fontFamily || 'Inter';
    const fontName = font.replace(/ /g, '+');
    const linkId = `google-font-${fontName}`;
    
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;600;700;900&display=swap`;
      document.head.appendChild(link);
    }
  }, [settings.fontFamily]);

  const handleSpin = () => {
    if (isSpinning || activeSegments.length === 0) return;
    
    setIsSpinning(true);
    setWinner(null);

    // Calculate new rotation
    const spins = 5 + Math.floor(Math.random() * 5); // 5 to 9 full spins
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = rotation + (spins * 360) + randomDegree;
    
    setRotation(newRotation);

    // Calculate winner
    setTimeout(() => {
      const normalizedRotation = newRotation % 360;
      const pointerAngle = 270;
      // The angle on the original wheel that is currently under the pointer
      const originalAngleAtPointer = (360 + pointerAngle - normalizedRotation) % 360;
      
      const sliceAngle = 360 / activeSegments.length;
      const winningIndex = Math.floor(originalAngleAtPointer / sliceAngle);
      
      const winningSegment = activeSegments[winningIndex];
      setWinner(winningSegment);
      setIsSpinning(false);
      
      // Decrement count
      setSegments(prev => prev.map(s => 
        s.id === winningSegment.id ? { ...s, count: Math.max(0, s.count - 1) } : s
      ));
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [winningSegment.color, '#ffffff', '#000000']
      });
      
    }, settings.spinDuration * 1000);
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat relative"
      style={{ 
        backgroundImage: settings.backgroundImageUrl ? `url(${settings.backgroundImageUrl})` : undefined,
        backgroundColor: settings.backgroundImageUrl ? 'transparent' : '#f9fafb',
        fontFamily: settings.fontFamily ? `"${settings.fontFamily}", sans-serif` : '"Inter", sans-serif'
      }}
    >
      {/* Header */}
      <header className="p-4 flex justify-between items-center z-20 absolute top-0 left-0 right-0">
        <h1 className={`text-xl font-bold tracking-tight ${settings.backgroundImageUrl ? 'text-transparent select-none' : 'text-gray-800'}`}>
          {settings.backgroundImageUrl ? '' : 'Laimes Rats'}
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white rounded-full transition-colors flex items-center gap-2 shadow-sm"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Iestatījumi</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-24 pb-12 overflow-hidden">
        <div className="w-full max-w-3xl mt-auto">
          <Wheel
            segments={activeSegments}
            settings={settings}
            rotation={rotation}
            isSpinning={isSpinning}
            onSpin={handleSpin}
          />
        </div>
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        segments={segments}
        setSegments={setSegments}
        settings={settings}
        setSettings={setSettings}
      />

      <WinnerModal
        winner={winner}
        onClose={() => setWinner(null)}
      />
    </div>
  );
}
