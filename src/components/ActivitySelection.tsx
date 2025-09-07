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
    <div className="h-full bg-background overflow-hidden">
      <div className="grid grid-cols-2 gap-1 p-1 h-full">
        {contexts.map((context) => {
          const isSelected = selectedContext === context.id;
          const baseClasses = "h-full min-h-12 p-1 border rounded text-xs flex items-center justify-center transition-all cursor-pointer text-center";
          
          const buttonClasses = isSelected 
            ? `${baseClasses} bg-primary border-primary text-primary-foreground`
            : `${baseClasses} border-border text-foreground hover:border-muted-foreground`;

          return (
            <button
              key={context.id}
              onClick={() => onContextSelect(context.id)}
              className={buttonClasses}
              title={context.description}
            >
              <div className="text-center">
                <div className="font-medium">{context.label}</div>
                {context.description && (
                  <div className="text-xs opacity-70 mt-0.5 line-clamp-1">
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