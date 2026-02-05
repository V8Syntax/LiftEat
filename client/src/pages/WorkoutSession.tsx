
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  Square, 
  Plus, 
  Trash2, 
  Search, 
  Dumbbell,
  MoreVertical,
  Trophy
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { WorkoutSession as WorkoutSessionType, WorkoutExercise, ExerciseSet } from "@/lib/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// Local interface for available exercises from DB
interface DBExercise {
  _id: string;
  name: string;
  bodyPart: string;
}

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs"];

export default function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<WorkoutSessionType | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState("");
  
  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);

  // Add Exercise Modal State
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<DBExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (id && user) {
      fetchWorkout();
    }
  }, [id, user]);

  useEffect(() => {
    if (showAddExercise) {
      fetchAvailableExercises();
    }
  }, [showAddExercise, searchQuery, activeCategory]);

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
      setExercises(data.exercises);
    } catch (error) {
      toast.error("Error loading workout");
    }
  };

  const fetchAvailableExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (activeCategory !== "All") params.append("bodyPart", activeCategory.toLowerCase());
      
      const { data } = await api.get(`/exercises?${params.toString()}`);
      setAvailableExercises(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addExercise = async (exercise: DBExercise) => {
    try {
      await api.post(`/workouts/${id}/exercises`, {
        name: exercise.name,
        muscle_group: exercise.bodyPart,
      });
      await fetchWorkout();
      setShowAddExercise(false);
      toast.success(`Added ${exercise.name}`);
    } catch (error) {
      toast.error("Failed to add exercise");
    }
  };

  const addSet = async (workoutExerciseId: string, currentSets: ExerciseSet[]) => {
    try {
      await api.post(`/workouts/exercises/${workoutExerciseId}/sets`, {
        set_number: (currentSets?.length || 0) + 1,
      });
      await fetchWorkout();
    } catch (error) {
      toast.error("Could not add set");
    }
  };

  const updateSet = async (setId: string, updates: Partial<ExerciseSet>) => {
    try {
      // Optimistic update for UI responsiveness could go here
      await api.put(`/workouts/sets/${setId}`, updates);
      fetchWorkout();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    if (!confirm("Remove this exercise?")) return;
    try {
      await api.delete(`/workouts/exercises/${exerciseId}`);
      await fetchWorkout();
      toast.success("Exercise removed");
    } catch (error) {
      toast.error("Failed to remove");
    }
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

  if (!workout) return <div className="p-8 text-center text-white">Loading Workout...</div>;

  return (
    <AppLayout hideNav>
      <div className="min-h-screen bg-gray-950 pb-32">
        
        {/* --- Header --- */}
        <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-md border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/workout")} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-bold text-indigo-100">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          <div className="relative">
             <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="bg-transparent border-none text-2xl font-black text-white p-0 h-auto focus-visible:ring-0 placeholder:text-gray-600"
              placeholder="Workout Name..."
            />
            <Dumbbell className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
          </div>
        </div>

        {/* --- Exercise List --- */}
        <div className="p-4 space-y-6">
          {exercises.length === 0 && (
            <div className="text-center py-10 opacity-50">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No exercises yet.</p>
              <p className="text-sm text-gray-600">Tap the button below to start.</p>
            </div>
          )}

          {exercises.map((exercise) => (
            <div key={exercise.id} className="relative overflow-hidden rounded-2xl bg-gray-900 border border-white/5 shadow-lg">
              {/* Exercise Header */}
              <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
                <h3 className="font-bold text-lg text-white capitalize">{exercise.exercise_name}</h3>
                <button onClick={() => deleteExercise(exercise.id)} className="text-gray-500 hover:text-red-400 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Sets Header */}
              <div className="grid grid-cols-10 gap-2 px-4 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <div className="col-span-1 text-center">Set</div>
                <div className="col-span-3 text-center">kg</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-3 text-center">Done</div>
              </div>

              {/* Sets List */}
              <div className="px-4 pb-4 space-y-2">
                {exercise.sets?.map((set, index) => (
                  <div 
                    key={set.id} 
                    className={`grid grid-cols-10 gap-2 items-center transition-all ${set.is_completed ? "opacity-50" : "opacity-100"}`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/5 text-xs flex items-center justify-center text-gray-400 font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-black/20 border-white/10 text-center font-mono text-white h-9 focus:border-indigo-500"
                        value={set.weight_kg || ""}
                        onChange={(e) => updateSet(set.id, { weight_kg: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="0"
                        className="bg-black/20 border-white/10 text-center font-mono text-white h-9 focus:border-indigo-500"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(set.id, { reps: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-3 flex justify-center">
                      <button
                        onClick={() => updateSet(set.id, { is_completed: !set.is_completed })}
                        className={`w-full h-9 rounded-lg flex items-center justify-center transition-all ${
                          set.is_completed 
                            ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                            : "bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {set.is_completed ? <Check className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addSet(exercise.id, exercise.sets || [])}
                  className="w-full mt-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-8 text-xs font-bold uppercase tracking-wider"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Set
                </Button>
              </div>
            </div>
          ))}

          {/* Add Exercise Trigger */}
          <Button 
            className="w-full h-14 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-2xl gap-2 text-lg font-medium transition-all"
            onClick={() => setShowAddExercise(true)}
          >
            <Plus className="w-6 h-6" />
            Add Exercise
          </Button>
        </div>

        {/* --- Footer Action --- */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent pb-8">
          <Button
            onClick={finishWorkout}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Finish Workout
          </Button>
        </div>

        {/* --- ADD EXERCISE DIALOG --- */}
        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogContent className="bg-gray-950 border-gray-800 text-white max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle>Add Exercise</DialogTitle>
            </DialogHeader>
            
            <div className="px-4 pb-2 space-y-2">
               {/* Search */}
               <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  placeholder="Search exercises..." 
                  className="pl-9 bg-gray-900 border-gray-800 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border transition-colors ${
                      activeCategory === cat 
                        ? "bg-indigo-600 border-indigo-500 text-white" 
                        : "bg-gray-900 border-gray-800 text-gray-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableExercises.map((ex) => (
                <button
                  key={ex._id}
                  onClick={() => addExercise(ex)}
                  className="w-full text-left p-3 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-gray-200 group-hover:text-indigo-400">{ex.name}</div>
                    <div className="text-xs text-gray-500 uppercase">{ex.bodyPart}</div>
                  </div>
                  <Plus className="w-5 h-5 text-gray-600 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
