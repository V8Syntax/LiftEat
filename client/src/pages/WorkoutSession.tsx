import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Clock, Square } from "lucide-react";
import api from "@/lib/api"; // Changed
import { useAuth } from "@/contexts/AuthContext";
import type {
  WorkoutSession as WorkoutSessionType,
  WorkoutExercise,
  ExerciseSet,
  Exercise,
} from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<WorkoutSessionType | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutName, setWorkoutName] = useState("");

  useEffect(() => {
    if (id && user) {
      fetchWorkout();
      fetchAvailableExercises();
    }
  }, [id, user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workout?.is_active) {
      interval = setInterval(() => {
        const startTime = new Date(workout.started_at).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workout]);

  const fetchWorkout = async () => {
    try {
      const { data } = await api.get(`/workouts/${id}`);
      setWorkout(data.session);
      setWorkoutName(data.session.name);
      setExercises(data.exercises); // Backend should return exercises nested with sets
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAvailableExercises = async () => {
    const { data } = await api.get("/exercises");
    setAvailableExercises(data);
  };

  const addExercise = async (exercise: Exercise) => {
    try {
      await api.post(`/workouts/${id}/exercises`, {
        exercise_id: exercise.id, // or name, depending on backend logic
        name: exercise.name,
        muscle_group: exercise.muscle_group,
      });
      await fetchWorkout();
      setShowAddExercise(false);
      toast.success(`Added ${exercise.name}`);
    } catch (error) {
      toast.error("Failed to add exercise");
    }
  };

  const addSet = async (
    workoutExerciseId: string,
    currentSets: ExerciseSet[],
  ) => {
    try {
      await api.post(`/workouts/exercises/${workoutExerciseId}/sets`, {
        set_number: currentSets.length + 1,
      });
      await fetchWorkout();
    } catch (error) {
      console.error(error);
    }
  };

  const updateSet = async (setId: string, updates: Partial<ExerciseSet>) => {
    try {
      // Optimistic update can be done here for speed
      await api.put(`/workouts/sets/${setId}`, updates);
      await fetchWorkout();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSet = async (setId: string) => {
    // Implementation for deleting a set
    await api.delete(`/workouts/sets/${setId}`);
    await fetchWorkout();
  };

  const deleteExercise = async (exerciseId: string) => {
    // Implementation for deleting an exercise
    await api.delete(`/workouts/exercises/${exerciseId}`);
    await fetchWorkout();
    toast.success("Exercise removed");
  };

  const finishWorkout = async () => {
    try {
      await api.put(`/workouts/${id}/finish`, {
        name: workoutName,
        duration_minutes: Math.floor(elapsedTime / 60),
      });
      toast.success("Workout completed! 💪");
      navigate("/workout");
    } catch (error) {
      toast.error("Failed to finish workout");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!workout) return <div>Loading...</div>;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="sticky top-0 z-10 glass-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate("/workout")} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>

            {workout.is_active ? (
              <div className="flex items-center gap-2 text-primary font-mono">
                <Clock className="w-4 h-4" />
                {formatTime(elapsedTime)}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {workout.duration_minutes} min
              </span>
            )}
          </div>

          {workout.is_active && (
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Workout name"
              className="mt-3 bg-secondary border-border text-lg font-semibold"
            />
          )}
        </div>

        {/* Exercises Loop */}
        <div className="p-4 space-y-4">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="glass-card">
              {/* ... Render sets loop similar to original, calling updateSet ... */}
              <h3>{exercise.exercise_name}</h3>
              {exercise.sets?.map((set) => (
                <div key={set.id} className="flex gap-2 mb-2">
                  <div className="w-8">{set.set_number}</div>
                  <Input
                    type="number"
                    value={set.weight_kg || ""}
                    onChange={(e) =>
                      updateSet(set.id, {
                        weight_kg: parseFloat(e.target.value),
                      })
                    }
                  />
                  <Input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(set.id, { reps: parseFloat(e.target.value) })
                    }
                  />
                  <button
                    onClick={() =>
                      updateSet(set.id, { is_completed: !set.is_completed })
                    }
                  >
                    {set.is_completed ? (
                      <Check className="text-green-500" />
                    ) : (
                      <Square />
                    )}
                  </button>
                </div>
              ))}
              {workout.is_active && (
                <Button
                  size="sm"
                  onClick={() => addSet(exercise.id, exercise.sets || [])}
                >
                  Add Set
                </Button>
              )}
            </div>
          ))}

          {workout.is_active && (
            <Button className="w-full" onClick={() => setShowAddExercise(true)}>
              Add Exercise
            </Button>
          )}
        </div>

        {workout.is_active && (
          <div className="fixed bottom-0 left-0 right-0 p-4 glass-card border-t border-border">
            <Button
              onClick={finishWorkout}
              className="w-full btn-primary-gradient"
            >
              Finish Workout
            </Button>
          </div>
        )}

        {/* Add Exercise Dialog */}
        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {availableExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="w-full text-left p-2 hover:bg-muted rounded"
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
