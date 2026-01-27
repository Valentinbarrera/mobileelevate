import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Routine } from "@/pages/Routines";
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
      className="space-y-4"
    >
      {/* Week Calendar */}
      <div className="bg-card/50 border border-border rounded-3xl mx-4 overflow-hidden">
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
