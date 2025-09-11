import React, { createContext, useContext, useState, useEffect } from 'react';

interface DateContextType {
  currentDate: Date;
  academicYearStart: Date;
  isInitialized: boolean;
  setCurrentDate: (date: Date) => void;
  setAcademicYearStart: (date: Date) => void;
  initializeData: () => Promise<void>;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
};

interface DateProviderProps {
  children: React.ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [academicYearStart, setAcademicYearStart] = useState(new Date('2024-09-01'));
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeData = async () => {
    // This will be called by useReportingData on first admin login
    setIsInitialized(true);
  };

  useEffect(() => {
    // Load from localStorage if available
    const savedCurrentDate = localStorage.getItem('admin_current_date');
    const savedAcademicStart = localStorage.getItem('admin_academic_year_start');
    
    if (savedCurrentDate) {
      setCurrentDate(new Date(savedCurrentDate));
    }
    if (savedAcademicStart) {
      setAcademicYearStart(new Date(savedAcademicStart));
    }
  }, []);

  const handleSetCurrentDate = (date: Date) => {
    setCurrentDate(date);
    localStorage.setItem('admin_current_date', date.toISOString());
  };

  const handleSetAcademicYearStart = (date: Date) => {
    setAcademicYearStart(date);
    localStorage.setItem('admin_academic_year_start', date.toISOString());
  };

  return (
    <DateContext.Provider
      value={{
        currentDate,
        academicYearStart,
        isInitialized,
        setCurrentDate: handleSetCurrentDate,
        setAcademicYearStart: handleSetAcademicYearStart,
        initializeData,
      }}
    >
      {children}
    </DateContext.Provider>
  );
};