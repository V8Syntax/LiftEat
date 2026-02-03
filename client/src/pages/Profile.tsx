import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Settings, LogOut, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Profile() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    weight_kg: profile?.weight_kg?.toString() || "",
    height_cm: profile?.height_cm?.toString() || "",
    daily_calorie_goal: profile?.daily_calorie_goal?.toString() || "2000",
    daily_protein_goal: profile?.daily_protein_goal?.toString() || "150",
    daily_carbs_goal: profile?.daily_carbs_goal?.toString() || "200",
    daily_fat_goal: profile?.daily_fat_goal?.toString() || "65",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        weight_kg: parseFloat(formData.weight_kg) || null,
        height_cm: parseFloat(formData.height_cm) || null,
        daily_calorie_goal: parseInt(formData.daily_calorie_goal) || 2000,
        daily_protein_goal: parseInt(formData.daily_protein_goal) || 150,
        daily_carbs_goal: parseInt(formData.daily_carbs_goal) || 200,
        daily_fat_goal: parseInt(formData.daily_fat_goal) || 65,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 max-w-lg mx-auto pb-24">
        {/* Header */}
        <div className="pt-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* User Info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {profile?.full_name || "Athlete"}
              </h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Form Fields - Same as original but data bound to state */}
        <div className="glass-card p-4 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Personal Info
          </h3>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                value={formData.weight_kg}
                onChange={(e) =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                value={formData.height_cm}
                onChange={(e) =>
                  setFormData({ ...formData, height_cm: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full btn-primary-gradient"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
