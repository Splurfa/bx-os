
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton = ({ onClick }: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 scale-in stagger-5">
      <button 
        onClick={onClick}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 hover:shadow-xl transition-all duration-300 flex group transform hover:scale-105 text-white rounded-full shadow-lg items-center justify-center"
      >
        <Plus className="group-hover:rotate-90 transition-transform duration-300 w-6 h-6" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
