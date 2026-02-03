import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Play } from "lucide-react";
import api from "@/lib/api"; // Changed
import { useAuth } from "@/contexts/AuthContext";
import { WorkoutSession, Exercise } from "@/lib/types";

export default function Workout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(
    null,
  );
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSession[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/workouts/overview"); // Needs endpoint
      setActiveWorkout(data.activeWorkout);
      setRecentWorkouts(data.recentWorkouts);

      const { data: exerciseData } = await api.get("/exercises");
      setExercises(exerciseData);
    } catch (error) {
      console.error(error);
    }
  };

  const startNewWorkout = async () => {
    try {
      const { data } = await api.post("/workouts/start", {
        name: "New Workout",
      });
      navigate(`/workout/${data.id}`);
    } catch (error) {
      console.error("Failed to start workout", error);
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesMuscle = !selectedMuscle || ex.muscle_group === selectedMuscle;
    return matchesSearch && matchesMuscle;
  });

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Workout</h1>
          <Button onClick={startNewWorkout} className="btn-primary-gradient">
            <Plus className="w-4 h-4 mr-2" /> New Workout
          </Button>
        </div>

        {activeWorkout && (
          <Link
            to={`/workout/${activeWorkout.id}`}
            className="glass-card p-4 block border-2 border-primary glow-hover animate-pulse-glow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center pulse-dot">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Active Workout</p>
                  <p className="text-sm text-muted-foreground">
                    {activeWorkout.name}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-primary" />
            </div>
          </Link>
        )}

        {/* ... Rest of JSX same as original file ... */}
        {/* Exercise List */}
        <div className="space-y-2">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <p>{exercise.name}</p>
              <span className="muscle-badge">{exercise.muscle_group}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
