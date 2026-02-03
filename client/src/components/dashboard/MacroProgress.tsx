import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type SingleMacroProps = {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color?: string;
};

type AggregateMacroProps = {
  protein: number;
  carbs: number;
  fat: number;
  goal: number;
};

type MacroProgressProps = SingleMacroProps | AggregateMacroProps;

export function MacroProgress(props: MacroProgressProps) {
  // Single macro view
  if ((props as SingleMacroProps).label) {
    const { label, current, goal, unit } = props as SingleMacroProps;
    const value = Math.min(Math.round((current / goal) * 100), 100);
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="font-semibold">
            {current}
            {unit || ""}
          </span>
        </div>
        <Progress value={value} />
      </Card>
    );
  }

  // Aggregate view
  const { protein, carbs, fat, goal } = props as AggregateMacroProps;
  const total = protein + carbs + fat;
  const percentage = (total / goal) * 100;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Today's Macros</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Protein</span>
            <span className="font-semibold">{protein}g</span>
          </div>
          <Progress value={(protein / (goal * 0.3)) * 100} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Carbs</span>
            <span className="font-semibold">{carbs}g</span>
          </div>
          <Progress value={(carbs / (goal * 0.5)) * 100} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Fat</span>
            <span className="font-semibold">{fat}g</span>
          </div>
          <Progress value={(fat / (goal * 0.2)) * 100} />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-semibold">
            {total} / {goal} kcal
          </span>
        </div>
        <Progress value={Math.min(percentage, 100)} className="mt-2" />
      </div>
    </Card>
  );
}
