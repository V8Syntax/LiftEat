
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AICoachWidget } from "@/components/AICoachWidget";
import { 
  Search, 
  Dumbbell, 
  Plus, 
  Play, 
  ChevronRight, 
  Star, 
  AlertTriangle, 
  Zap, 
  Activity,
  ThumbsUp,
  LayoutGrid,
  Timer,
  Filter
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  _id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  images: string[];
  instructions: string[];
  stats?: {
    totalReviews: number;
    injuryRate: number;
    effectiveness: number;
  };
}

const CATEGORIES = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Abs", "Cardio"];

export default function Workout() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // New Workout State
  const [newWorkoutName, setNewWorkoutName] = useState("");

  useEffect(() => {
    fetchExercises();
  }, [query, activeCategory]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      // Use the new versatile endpoint
      const params = new URLSearchParams();
      if (query) params.append("query", query);
      if (activeCategory !== "All") params.append("bodyPart", activeCategory.toLowerCase());
      
      const { data } = await api.get(`/exercises?${params.toString()}`);
      setExercises(data);
    } catch (error) {
      toast.error("Could not load exercises");
    } finally {
      setLoading(false);
    }
  };

  const handleStartClick = (defaultName: string) => {
    setNewWorkoutName(defaultName);
    setStartDialogOpen(true);
  };

  const confirmStartWorkout = async () => {
    if (!newWorkoutName.trim()) return;
    
    try {
      const { data } = await api.post('/workouts/start', { 
        name: newWorkoutName
      });
      toast.success("Workout started!");
      navigate(`/workout/${data._id}`);
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const openDetails = (ex: Exercise) => {
    setSelectedExercise(ex);
    setDetailsOpen(true);
  };

  const submitRating = async (rating: 'EFFECTIVE' | 'DIDNT_FEEL' | 'INJURED') => {
    if (!selectedExercise) return;
    try {
      await api.post('/exercises/rate', {
        exerciseId: selectedExercise._id,
        rating,
        comment: "Quick rating"
      });
      toast.success("Feedback recorded!");
      setRateModalOpen(false);
      fetchExercises(); 
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  const scrollToLibrary = () => {
    document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
        
        {/* --- Hero --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
                <Dumbbell className="w-8 h-8 text-indigo-400" />
                Workout
              </h1>
              <p className="text-indigo-200 max-w-sm text-sm">
                Ready to crush your goals? Start a session below.
              </p>
            </div>
            <Button size="icon" className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full">
              <Plus className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        <AICoachWidget page="workout" contextData={{ lastSession: "Yesterday" }} />

        {/* --- Quick Start Actions --- */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">Start Workout</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => handleStartClick("Evening Session")}
              className="h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white border-0 rounded-2xl flex flex-col gap-2 shadow-lg col-span-2 md:col-span-1 transition-all active:scale-95"
            >
              <Play className="w-8 h-8 fill-white/20" />
              <span className="font-bold text-lg">Empty Session</span>
            </Button>

            <div className="grid grid-rows-2 gap-3 md:col-span-1">
              <Button 
                onClick={() => handleStartClick("Strength Training")}
                variant="outline" 
                className="h-full justify-start bg-gray-900/50 border-white/10 hover:bg-white/5 hover:text-indigo-400 active:scale-95 transition-all"
              >
                <Dumbbell className="w-4 h-4 mr-2" /> Strength
              </Button>
              <Button 
                 onClick={() => handleStartClick("Cardio Session")}
                 variant="outline" 
                 className="h-full justify-start bg-gray-900/50 border-white/10 hover:bg-white/5 hover:text-pink-400 active:scale-95 transition-all"
              >
                <Timer className="w-4 h-4 mr-2" /> Cardio
              </Button>
            </div>
          </div>
        </section>

        {/* --- Search & Explore --- */}
        <div className="sticky top-4 z-20 space-y-2" id="library-section">
          <div className="flex gap-2 glass-card p-2 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md bg-gray-900/80">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <Input 
                placeholder="Search exercises..." 
                className="pl-11 bg-transparent border-0 focus-visible:ring-0 text-base text-white h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-white/10 rounded-xl"
            >
              <Filter className="w-5 h-5 text-indigo-400" />
            </Button>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                    : "bg-gray-900/50 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* --- Library --- */}
        <section className="space-y-2 min-h-[300px]">
          {loading ? (
            <div className="grid place-items-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-2">
              {exercises.map((ex) => (
                <div 
                  key={ex._id}
                  onClick={() => openDetails(ex)}
                  className="group flex items-center gap-4 p-3 bg-gray-900/50 border border-white/5 hover:border-indigo-500/50 rounded-2xl transition-all cursor-pointer active:bg-indigo-950/40"
                >
                  <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden flex-shrink-0 border border-white/5 relative">
                     {ex.images?.[0] ? (
                       <img src={ex.images[0]} alt="" className="w-full h-full object-contain opacity-80 group-hover:opacity-100" />
                     ) : (
                       <Dumbbell className="w-6 h-6 text-gray-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                     )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-indigo-400 capitalize truncate">{ex.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-white/10 text-gray-400 uppercase">{ex.bodyPart}</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">{ex.equipment}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-indigo-500/50 group-hover:text-indigo-400" />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* --- START WORKOUT DIALOG --- */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="bg-gray-950 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Name Your Workout</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your session a name to track it better.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newWorkoutName}
              onChange={(e) => setNewWorkoutName(e.target.value)}
              className="bg-gray-900 border-gray-700 text-lg font-bold"
              placeholder="e.g. Leg Day Destruction"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setStartDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmStartWorkout} className="bg-indigo-600 hover:bg-indigo-700">
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DETAILS MODAL --- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl bg-gray-950 border-gray-800 p-0 overflow-hidden">
          {selectedExercise && (
            <div className="flex flex-col md:flex-row max-h-[90vh]">
              <div className="w-full md:w-5/12 bg-black/40 p-6 flex flex-col border-r border-white/5">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-6 p-4 relative">
                   {selectedExercise.images?.[0] ? (
                      <img src={selectedExercise.images[0]} className="w-full h-full object-contain" alt="" />
                   ) : (
                      <Dumbbell className="w-12 h-12 text-gray-700 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-indigo-600 capitalize">{selectedExercise.bodyPart}</Badge>
                    <Badge variant="outline" className="text-indigo-400 border-indigo-400/30 capitalize">{selectedExercise.equipment}</Badge>
                  </div>
                  
                  <Button 
                    onClick={() => setRateModalOpen(true)}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-2"
                  >
                    <Star className="w-4 h-4 mr-2" /> Rate Form
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-black text-white capitalize italic tracking-tight">
                    {selectedExercise.name}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Execution Steps
                  </h3>
                  <div className="space-y-4 border-l border-white/10 pl-4">
                    {selectedExercise.instructions?.map((step, i) => (
                      <div key={i} className="relative">
                         <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                         <p className="text-sm text-gray-400 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
