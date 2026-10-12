import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Upload,
  Check,
  Sliders,
  Pipette,
  Sparkles,
} from 'lucide-react';
import { BASE_COLOR_PRESETS, DEFAULT_PHOTO_PRESETS } from '../backgroundPresets';
import { hexToRgba, isDarkColor } from '../colorUtils';

interface BoardSettingsModalProps {
  currentBackground?: string;
  currentBgFilterColor?: string;
  currentBgFilterOpacity?: number;
  currentListColor?: string;
  currentListOpacity?: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (settings: {
    background?: string;
    bgFilterColor?: string;
    bgFilterOpacity?: number;
    listColor?: string;
    listOpacity?: number;
  }) => void;
}

const LIST_COLOR_PRESETS = [
  { name: 'Wit', value: '#ffffff' },
  { name: 'Warm Grijs', value: '#f1f5f9' },
  { name: 'Zacht Blauw', value: '#e0f2fe' },
  { name: 'Zacht Groen', value: '#dcfce7' },
  { name: 'Zacht Geel', value: '#fef9c3' },
  { name: 'Zacht Roze', value: '#ffe4e6' },
  { name: 'Donker Leisteen', value: '#1e293b' },
  { name: 'Puur Zwart', value: '#0f172a' },
];

const FILTER_COLOR_PRESETS = [
  { name: 'Zwart', value: '#000000' },
  { name: 'Donkerblauw', value: '#0f172a' },
  { name: 'Leisteen', value: '#334155' },
  { name: 'Warm Bruin', value: '#451a03' },
  { name: 'Wit', value: '#ffffff' },
  { name: 'Dieppaars', value: '#2e1065' },
];

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({
  currentBackground,
  currentBgFilterColor = '#000000',
  currentBgFilterOpacity = 0,
  currentListColor = '#ffffff',
  currentListOpacity = 70,
  isOpen,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const [activeMainTab, setActiveMainTab] = useState<'background' | 'lists'>('background');
  // Background sub-selector: 'colors' | 'photos' | 'upload'
  const [bgMode, setBgMode] = useState<'colors' | 'photos' | 'upload'>('colors');

  const [customRgbColor, setCustomRgbColor] = useState('#3b82f6');
  const [listColor, setListColor] = useState(currentListColor);
  const [listOpacity, setListOpacity] = useState(currentListOpacity);

  const [bgFilterColor, setBgFilterColor] = useState(currentBgFilterColor);
  const [bgFilterOpacity, setBgFilterOpacity] = useState(currentBgFilterOpacity);

  useEffect(() => {
    setListColor(currentListColor);
  }, [currentListColor]);

  useEffect(() => {
    setListOpacity(currentListOpacity);
  }, [currentListOpacity]);

  useEffect(() => {
    setBgFilterColor(currentBgFilterColor);
  }, [currentBgFilterColor]);

  useEffect(() => {
    setBgFilterOpacity(currentBgFilterOpacity);
  }, [currentBgFilterOpacity]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading image from PC
  const handleUploadClick = async () => {
    // If inside Electron with IPC bridge, use native open dialog
    if (typeof window !== 'undefined' && window.electronAPI?.pickImage) {
      try {
        const dataUrl = await window.electronAPI.pickImage();
        if (dataUrl) {
          onUpdateSettings({
            background: `url("${dataUrl}") center/cover no-repeat`,
            bgFilterColor,
            bgFilterOpacity,
          });
        }
      } catch (err) {
        console.error('Electron pickImage error:', err);
      }
    } else {
      // Browser fallback using input[type=file]
      fileInputRef.current?.click();
    }
  };

  const handleBrowserFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateSettings({
          background: `url("${dataUrl}") center/cover no-repeat`,
          bgFilterColor,
          bgFilterOpacity,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomRgbApply = (colorHex: string) => {
    setCustomRgbColor(colorHex);
    onUpdateSettings({ background: colorHex });
  };

  const handleColorChange = (color: string) => {
    setListColor(color);
    onUpdateSettings({ listColor: color, listOpacity });
  };

  const handleOpacityChange = (opacity: number) => {
    setListOpacity(opacity);
    onUpdateSettings({ listColor, listOpacity: opacity });
  };

  const handleFilterColorChange = (color: string) => {
    setBgFilterColor(color);
    // If opacity was 0, set a default gentle tint of 30% so the user immediately sees the effect
    const newOpacity = bgFilterOpacity === 0 ? 30 : bgFilterOpacity;
    setBgFilterOpacity(newOpacity);
    onUpdateSettings({ bgFilterColor: color, bgFilterOpacity: newOpacity });
  };

  const handleFilterOpacityChange = (opacity: number) => {
    setBgFilterOpacity(opacity);
    onUpdateSettings({ bgFilterColor, bgFilterOpacity: opacity });
  };

  const isListDark = isDarkColor(listColor, listOpacity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-2xl p-5 flex flex-col max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="font-semibold text-slate-800 text-sm">
            Bord Instellingen
          </span>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Tabs (Achtergrond vs Lijsten) */}
        <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-xl my-3">
          <button
            type="button"
            onClick={() => setActiveMainTab('background')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMainTab === 'background'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Achtergrond
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('lists')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeMainTab === 'lists'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Lijsten & Transparantie
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 p-1 space-y-4">
          {activeMainTab === 'background' ? (
            <div className="space-y-4">
              {/* Background sub-selector: Basiskleuren, Standaardfoto's, Geüploade foto */}
              <div className="flex border-b border-slate-200/80 pb-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBgMode('colors')}
                  className={`pb-1 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    bgMode === 'colors'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" /> Basiskleuren
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('photos')}
                  className={`pb-1 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    bgMode === 'photos'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Standaardfoto's (18)
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('upload')}
                  className={`pb-1 px-2 font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    bgMode === 'upload'
                      ? 'border-blue-600 text-blue-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Geüploade foto
                </button>
              </div>

              {/* Sub-mode 1: 11 Basiskleuren + 12e RGB Picker */}
              {bgMode === 'colors' && (
                <div>
                  <div className="grid grid-cols-4 gap-2.5 p-1.5">
                    {/* 11 pre-defined base colors */}
                    {BASE_COLOR_PRESETS.map((color) => {
                      const isSelected = currentBackground === color.value;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => onUpdateSettings({ background: color.value })}
                          className={`relative h-16 rounded-xl border transition-all cursor-pointer overflow-hidden p-1.5 flex flex-col justify-end group shadow-2xs ${
                            isSelected
                              ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent scale-[1.02]'
                              : 'border-black/5 hover:scale-[1.02] hover:shadow-xs'
                          }`}
                          style={{ background: color.value }}
                        >
                          <span className="text-[10px] font-medium text-white drop-shadow-md truncate">
                            {color.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {/* 12th item: Interactive RGB Color Picker box */}
                    <div className="relative h-16 rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-1.5 flex flex-col justify-between bg-slate-50 shadow-2xs group">
                      <div className="flex items-center justify-between">
                        <Pipette className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          RGB
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={customRgbColor}
                          onChange={(e) => handleCustomRgbApply(e.target.value)}
                          className="w-full h-6 rounded cursor-pointer border border-black/10 bg-transparent p-0"
                          title="Kies een eigen RGB kleur"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-mode 2: 18 Predefined Scenic Photos */}
              {bgMode === 'photos' && (
                <div>
                  <div className="grid grid-cols-3 gap-2.5 p-1.5">
                    {DEFAULT_PHOTO_PRESETS.map((photo) => {
                      const isSelected = currentBackground === photo.value;
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => onUpdateSettings({ background: photo.value })}
                          className={`relative h-20 rounded-xl border transition-all cursor-pointer overflow-hidden p-2 flex flex-col justify-end group shadow-2xs ${
                            isSelected
                              ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent scale-[1.02]'
                              : 'border-black/5 hover:scale-[1.02] hover:shadow-md'
                          }`}
                          style={{ background: photo.value }}
                        >
                          <span className="text-[11px] font-medium text-white drop-shadow-md truncate">
                            {photo.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-mode 3: Upload from local PC + Filter Options */}
              {bgMode === 'upload' && (
                <div className="py-2 space-y-4">
                  {/* Hidden file input for web fallback */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleBrowserFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Upload button area */}
                  <div
                    onClick={handleUploadClick}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all text-center"
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Kies een foto vanaf deze PC
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Volledig offline opgeslagen (JPG, PNG, WebP)
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Bestand kiezen...
                    </button>
                  </div>

                  {/* Filter / Overlay Section */}
                  <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-800">
                          Filter over foto (Overlay)
                        </span>
                      </div>
                      {bgFilterOpacity > 0 && (
                        <button
                          type="button"
                          onClick={() => handleFilterOpacityChange(0)}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        >
                          Filter resetten (0%)
                        </button>
                      )}
                    </div>

                    {/* Filter Color Presets */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-500 mb-1.5 block">
                        Kleur van het filter:
                      </label>
                      <div className="grid grid-cols-6 gap-2 mb-2">
                        {FILTER_COLOR_PRESETS.map((color) => {
                          const isSelected = bgFilterColor.toLowerCase() === color.value.toLowerCase();
                          return (
                            <button
                              key={color.value}
                              type="button"
                              onClick={() => handleFilterColorChange(color.value)}
                              className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent shadow-2xs'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              title={color.name}
                            >
                              <div
                                className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                                style={{ backgroundColor: color.value }}
                              />
                              <span className="text-[9px] text-slate-600 font-medium truncate w-full text-center">
                                {color.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Filter Color (Picker + HEX Input) */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <input
                          type="color"
                          value={bgFilterColor.startsWith('#') && (bgFilterColor.length === 7 || bgFilterColor.length === 4) ? bgFilterColor : '#000000'}
                          onChange={(e) => handleFilterColorChange(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                          title="Kies een eigen filterkleur"
                        />
                        <input
                          type="text"
                          placeholder="#000000"
                          value={bgFilterColor}
                          onChange={(e) => handleFilterColorChange(e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
                        />
                        <span className="text-[11px] text-slate-500">Eigen filterkleur (HEX)</span>
                      </div>
                    </div>

                    {/* Filter Opacity / Transparency Slider */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-slate-500">
                          Transparantie / Intensiteit van het filter:
                        </label>
                        <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {bgFilterOpacity === 0 ? 'Geen filter (0%)' : `${bgFilterOpacity}%`}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="5"
                        value={bgFilterOpacity}
                        onChange={(e) => handleFilterOpacityChange(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>Origineel (0%)</span>
                        <span>Gebalanceerd (35%)</span>
                        <span>Donker (90%)</span>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                        Voorbeeldweergave van de foto met filter:
                      </span>
                      <div
                        className="relative w-full h-24 rounded-xl shadow-2xs overflow-hidden border border-slate-200 flex items-center justify-center"
                        style={{
                          background: currentBackground && currentBackground.includes('data:image')
                            ? currentBackground
                            : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                        }}
                      >
                        {bgFilterOpacity > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none transition-all"
                            style={{
                              backgroundColor: hexToRgba(bgFilterColor, bgFilterOpacity),
                            }}
                          />
                        )}
                        <span className="relative z-10 px-2.5 py-1 rounded-md bg-white/85 backdrop-blur-md text-xs font-semibold text-slate-800 shadow-2xs">
                          {currentBackground && currentBackground.includes('data:image')
                            ? 'Lijsten en tekst blijven perfect leesbaar'
                            : 'Upload een foto om het live effect te zien'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 py-1">
              {/* List Color Selection */}
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" /> Kleur van de lijsten
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3 p-1.5">
                  {LIST_COLOR_PRESETS.map((color) => {
                    const isSelected = listColor.toLowerCase() === color.value.toLowerCase();
                    return (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorChange(color.value)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent shadow-xs'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-[10px] text-slate-600 font-medium truncate w-full text-center">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Input (Picker + HEX text) */}
                <div className="flex items-center gap-2.5 pt-1 px-1">
                  <input
                    type="color"
                    value={listColor.startsWith('#') && (listColor.length === 7 || listColor.length === 4) ? listColor : '#ffffff'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200 bg-transparent p-0.5 shrink-0"
                    title="Kies een kleur via kleurpalet"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="#1e293b"
                      value={listColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">Eigen kleurcode (HEX)</span>
                </div>
              </div>

              {/* List Opacity Slider */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-500">
                    Transparantie van de lijsten
                  </label>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {listOpacity}%
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={listOpacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />

                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Zeer transparant (10%)</span>
                  <span>Ondoorzichtig (100%)</span>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500 block mb-2">
                  Voorbeeldweergave van een lijst
                </span>
                <div
                  className="p-3 rounded-xl border border-white/40 shadow-xs backdrop-blur-xl transition-all"
                  style={{
                    backgroundColor: hexToRgba(listColor, listOpacity),
                  }}
                >
                  <div className={`text-xs font-semibold mb-2 transition-colors ${
                    isListDark ? 'text-white' : 'text-slate-800'
                  }`}>
                    Voorbeeld lijst
                  </div>
                  <div className="bg-white/90 p-2 rounded-lg text-xs text-slate-700 shadow-2xs">
                    Voorbeeld taakje
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Klaar
          </button>
        </div>
      </div>
    </div>
  );
};
