import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ActivitySelectionProps {
  selectedContext: string;
  onContextSelect: (contextId: string) => void;
}

interface AntecedentContext {
  id: string;
  key: string;
  label: string;
  description?: string;
  sort_order: number;
}

const ActivitySelection = ({ selectedContext, onContextSelect }: ActivitySelectionProps) => {
  const [contexts, setContexts] = useState<AntecedentContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const { data, error } = await supabase
          .from('antecedent_contexts')
          .select('*')
          .order('sort_order');

        if (error) throw error;
        setContexts(data || []);
      } catch (error) {
        console.error('Error fetching antecedent contexts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContexts();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading contexts...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-full">
        {contexts.map((context) => {
          const isSelected = selectedContext === context.id;
          const baseClasses = "h-full min-h-24 p-4 border-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all cursor-pointer text-center hover:shadow-sm";
          
          const buttonClasses = isSelected 
            ? `${baseClasses} bg-primary border-primary text-primary-foreground shadow-sm`
            : `${baseClasses} bg-card border-border text-foreground hover:border-muted-foreground`;

          return (
            <button
              key={context.id}
              onClick={() => onContextSelect(context.id)}
              className={buttonClasses}
              title={context.description}
            >
              <div className="text-center space-y-1">
                <div className="font-semibold">{context.label}</div>
                {context.description && (
                  <div className="text-xs opacity-80 line-clamp-2">
                    {context.description}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivitySelection;