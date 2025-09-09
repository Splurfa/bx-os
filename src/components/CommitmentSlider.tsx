import { useState } from "react";

interface CommitmentSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const CommitmentSlider = ({ value, onChange, label = "How committed are you to change?" }: CommitmentSliderProps) => {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  const getCommitmentState = () => {
    if (currentValue === 1) return 'not-at-all';
    if (currentValue === 2) return 'little';
    if (currentValue === 3) return 'somewhat';
    if (currentValue === 4) return 'very';
    return 'extremely';
  };

  const getCommitmentColor = () => {
    if (currentValue === 1) return 'hsl(var(--destructive))';
    if (currentValue === 2) return 'hsl(var(--warning))';
    if (currentValue === 3) return 'hsl(var(--muted-foreground))';
    if (currentValue === 4) return 'hsl(var(--success))';
    return 'hsl(var(--primary))';
  };

  const levels = [
    { id: 'not-at-all', label: 'Not ready', icon: '◯', value: 1 },
    { id: 'little', label: 'A little ready', icon: '◔', value: 2 },
    { id: 'somewhat', label: 'Half ready', icon: '◑', value: 3 },
    { id: 'very', label: 'Almost ready', icon: '◕', value: 4 },
    { id: 'extremely', label: 'Fully ready', icon: '●', value: 5 }
  ];

  return (
    <div className="bg-background">
      <div className="flex justify-center mb-2">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
      </div>
      <div className="relative px-2 mb-4 h-8">
        {/* Track Background */}
        <div 
          className="absolute top-1/2 left-0 transform -translate-y-1/2 h-2 w-full rounded-full"
          style={{
            background: 'linear-gradient(to right, hsl(var(--destructive)) 0%, hsl(var(--warning)) 25%, hsl(var(--muted-foreground)) 50%, hsl(var(--success)) 75%, hsl(var(--primary)) 100%)'
          }}
        />
        
        {/* Track Cover */}
        <div 
          className="absolute top-1/2 right-0 transform -translate-y-1/2 h-2 bg-background rounded-r-full transition-all duration-200"
          style={{ width: `${100 - ((currentValue - 1) / 4) * 100}%` }}
        />
        
        {/* Slider Input */}
        <input
          type="range"
          min="1"
          max="5"
          value={currentValue}
          onChange={handleChange}
          className="absolute inset-0 w-full h-8 bg-transparent appearance-none cursor-pointer z-10"
          style={{
            background: 'transparent'
          }}
        />
        
        {/* Custom Thumb */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-background border-3 rounded-full shadow-md transition-all duration-200 pointer-events-none z-20"
          style={{ 
            left: `${((currentValue - 1) / 4) * 100}%`,
            borderColor: getCommitmentColor()
          }}
        />
      </div>
      
      {/* Commitment Labels */}
      <div className="flex justify-between px-1">
        {levels.map((level) => (
          <div 
            key={level.id}
            className={`text-center transition-all duration-300 ${
              getCommitmentState() === level.id ? 'opacity-100 scale-110' : 'opacity-60 scale-95'
            }`}
          >
            <div className="text-lg mb-1">{level.icon}</div>
            <div className="text-xs font-medium text-muted-foreground">{level.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitmentSlider;