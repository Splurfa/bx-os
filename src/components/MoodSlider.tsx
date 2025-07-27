
import { useState } from "react";

interface MoodSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const MoodSlider = ({ value, onChange }: MoodSliderProps) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const getMoodState = () => {
    if (currentValue <= 25) return 'calm';
    if (currentValue <= 60) return 'steady';
    if (currentValue <= 85) return 'anxious';
    return 'frazzled';
  };

  const getMoodColor = () => {
    if (currentValue <= 25) return '#3b82f6';
    if (currentValue <= 60) return '#10b981';
    if (currentValue <= 85) return '#f59e0b';
    return '#ef4444';
  };

  const moods = [
    { id: 'calm', label: 'Calm', icon: '🧘‍♀️' },
    { id: 'steady', label: 'Steady', icon: '😌' },
    { id: 'anxious', label: 'Anxious', icon: '😰' },
    { id: 'frazzled', label: 'Frazzled', icon: '🤯' }
  ];

  return (
    <div className="bg-background">
      <div className="flex justify-center mb-2">
        <span className="text-muted-foreground text-xs">How are you feeling?</span>
      </div>
      <div className="relative px-2 mb-3 h-6">
        {/* Track Background */}
        <div 
          className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1 w-full rounded-full"
          style={{
            background: 'linear-gradient(to right, #3b82f6 0%, #10b981 33%, #f59e0b 66%, #ef4444 100%)'
          }}
        />
        
        {/* Track Cover */}
        <div 
          className="absolute top-1/2 right-0 transform -translate-y-1/2 h-1 bg-background rounded-r-full transition-all duration-200"
          style={{ width: `${100 - currentValue}%` }}
        />
        
        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          onChange={handleChange}
          className="absolute inset-0 w-full h-6 bg-transparent appearance-none cursor-pointer z-10"
          style={{
            background: 'transparent'
          }}
        />
        
        {/* Custom Thumb */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-background border-2 rounded-full shadow-sm transition-all duration-200 pointer-events-none z-20"
          style={{ 
            left: `${currentValue}%`,
            borderColor: getMoodColor()
          }}
        />
      </div>
      
      {/* Mood Labels */}
      <div className="flex justify-between px-1">
        {moods.map((mood, index) => (
          <div 
            key={mood.id}
            className={`text-center transition-all duration-300 ${
              getMoodState() === mood.id ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
            }`}
          >
            <div className="text-xs mb-0.5">{mood.icon}</div>
            <div className="text-[9px] font-medium text-muted-foreground">{mood.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodSlider;
