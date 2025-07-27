
interface BehaviorSelectionProps {
  selectedBehaviors: string[];
  onBehaviorToggle: (behavior: string) => void;
}

const behaviors = [
  { 
    id: 'disruptive', 
    label: 'Disruptive', 
    selectedClasses: 'bg-behavior-disruptive border-behavior-disruptive text-white shadow-sm',
    unselectedClasses: 'bg-behavior-disruptive-light border-behavior-disruptive-light text-behavior-disruptive'
  },
  { 
    id: 'social-emotional', 
    label: 'Social-Emotional', 
    selectedClasses: 'bg-behavior-social border-behavior-social text-white shadow-sm',
    unselectedClasses: 'bg-behavior-social-light border-behavior-social-light text-behavior-social'
  },
  { 
    id: 'avoidance', 
    label: 'Avoidance', 
    selectedClasses: 'bg-behavior-avoidance border-behavior-avoidance text-white shadow-sm',
    unselectedClasses: 'bg-behavior-avoidance-light border-behavior-avoidance-light text-behavior-avoidance'
  },
  { 
    id: 'eloping', 
    label: 'Eloping', 
    selectedClasses: 'bg-behavior-eloping border-behavior-eloping text-white shadow-sm',
    unselectedClasses: 'bg-behavior-eloping-light border-behavior-eloping-light text-behavior-eloping'
  },
  { 
    id: 'minor-physical', 
    label: 'Minor-Physical', 
    selectedClasses: 'bg-behavior-minor-physical border-behavior-minor-physical text-white shadow-sm',
    unselectedClasses: 'bg-behavior-minor-physical-light border-behavior-minor-physical-light text-behavior-minor-physical'
  },
  { 
    id: 'major-physical', 
    label: 'Major-Physical', 
    selectedClasses: 'bg-behavior-major-physical border-behavior-major-physical text-white shadow-sm',
    unselectedClasses: 'bg-behavior-major-physical-light border-behavior-major-physical-light text-behavior-major-physical'
  }
];

const BehaviorSelection = ({ selectedBehaviors, onBehaviorToggle }: BehaviorSelectionProps) => {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="grid grid-cols-2 grid-rows-3 gap-3 p-4 h-full">
        {behaviors.map((behavior) => {
          const isSelected = selectedBehaviors.includes(behavior.id);
          const baseClasses = "h-full p-3 border-2 rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer text-center";
          
          const buttonClasses = isSelected 
            ? `${baseClasses} ${behavior.selectedClasses}`
            : `${baseClasses} ${behavior.unselectedClasses}`;

          return (
            <button
              key={behavior.id}
              onClick={() => onBehaviorToggle(behavior.id)}
              className={buttonClasses}
            >
              {behavior.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BehaviorSelection;
