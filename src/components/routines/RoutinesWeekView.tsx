import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Routine } from "@/types/routine";
import WeekDaySelector from "./WeekDaySelector";
import DayRoutineDetail from "./DayRoutineDetail";

interface RoutinesWeekViewProps {
  routines: Routine[];
}

const RoutinesWeekView = ({ routines }: RoutinesWeekViewProps) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Initialize with today
  useEffect(() => {
    const today = new Date().toLocaleDateString("es-ES", { weekday: "long" });
    const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1);
    setSelectedDay(todayCapitalized);
  }, []);

  const selectedRoutine = selectedDay 
    ? routines.find(r => r.dayLabel === selectedDay) 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Week Calendar */}
      <div className="bg-card/60 border border-border/50 rounded-2xl mx-4 overflow-hidden backdrop-blur-sm">
        <WeekDaySelector
          routines={routines}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <DayRoutineDetail
          routine={selectedRoutine || null}
          dayLabel={selectedDay}
        />
      )}
    </motion.div>
  );
};

export default RoutinesWeekView;
