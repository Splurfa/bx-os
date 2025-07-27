
import { Users } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 scale-in stagger-1">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center floating">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="slide-up stagger-2">
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">
            No Active Requests
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed text-base">
            Press the "+" button to begin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
