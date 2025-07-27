
import { useState, useEffect } from 'react';

export interface QueueItem {
  id: string;
  studentName: string;
  behaviors: string[];
  mood: string;
  position: number;
  timestamp: Date;
  status: 'waiting' | 'active' | 'completed' | 'urgent';
  reflection?: {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    submittedAt: Date;
  };
}

export const useQueue = () => {
  const [items, setItems] = useState<QueueItem[]>([]);

  // Format time elapsed
  const formatTimeElapsed = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min';
    if (diffMins < 60) return `${diffMins} mins`;
    
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours === 1) {
      return remainingMins > 0 ? `1h ${remainingMins}m` : '1 hour';
    }
    
    return remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours} hours`;
  };

  // Add new item to queue
  const addToQueue = (data: { studentName: string; behaviors: string[]; mood: string; urgent?: boolean }) => {
    const newItem: QueueItem = {
      id: Date.now().toString(),
      studentName: data.studentName,
      behaviors: data.behaviors,
      mood: data.mood,
      position: items.length + 1,
      timestamp: new Date(),
      status: data.urgent ? 'urgent' : 'waiting'
    };

    setItems(prev => [...prev, newItem]);
  };

  // Remove item from queue
  const removeFromQueue = (id: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // Reorder positions
      return filtered.map((item, index) => ({
        ...item,
        position: index + 1
      }));
    });
  };

  // Complete reflection
  const completeReflection = (id: string, reflection: QueueItem['reflection']) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'completed' as const, reflection }
          : item
      )
    );
  };

  // Clear all queue items
  const clearQueue = () => {
    setItems([]);
  };

  return {
    items,
    addToQueue,
    removeFromQueue,
    completeReflection,
    clearQueue,
    formatTimeElapsed
  };
};
