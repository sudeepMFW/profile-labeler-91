import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Profile, UpdatePayload } from "@/lib/api";
import { updateProfile } from "@/lib/api";
import { Check, Loader2 } from "lucide-react";

const FIELDS = [
  {
    key: "hair_style" as const,
    label: "Hair Style",
    options: ["straight", "curly"],
    getDefault: (p: Profile) => p.image_attributes?.hair?.hair_style,
  },
  {
    key: "hair_length" as const,
    label: "Hair Length",
    options: ["long", "medium", "short"],
    getDefault: (p: Profile) => p.image_attributes?.hair_length,
  },
  {
    key: "eye_color" as const,
    label: "Eye Color",
    options: ["blue", "green", "grey", "black"],
    getDefault: (p: Profile) => p.image_attributes?.eye_color,
  },
  {
    key: "eye_size" as const,
    label: "Eye Size",
    options: ["normal", "large", "small", "None"],
    getDefault: (p: Profile) => p.image_attributes?.eye_size,
  },
  {
    key: "skin_color" as const,
    label: "Skin Color",
    options: ["white", "black", "brown"],
    getDefault: (p: Profile) => p.image_attributes?.skin_color,
  },
];

type FieldKey = (typeof FIELDS)[number]["key"];

interface ProfileCardProps {
  profile: Profile;
  onSaved: (id: string) => void;
}

const ProfileCard = ({ profile, onSaved }: ProfileCardProps) => {
  const [values, setValues] = useState<Record<FieldKey, string>>(() => {
    const init: Record<string, string> = {};
    FIELDS.forEach((f) => {
      const def = f.getDefault(profile);
      init[f.key] = def && f.options.includes(def) ? def : "";
    });
    return init as Record<FieldKey, string>;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const allFilled = FIELDS.every((f) => values[f.key] !== "");

  const handleSave = useCallback(async () => {
    if (!allFilled) return;
    setSaving(true);
    try {
      const payload: UpdatePayload = {
        _id: profile._id,
        _collection: profile._collection,
        hair_style: values.hair_style,
        hair_length: values.hair_length,
        eye_color: values.eye_color,
        eye_size: values.eye_size,
        skin_color: values.skin_color,
      };
      await updateProfile(payload);
      toast.success("Updated successfully");
      setSaved(true);
      setTimeout(() => onSaved(profile._id), 400);
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  }, [allFilled, values, profile, onSaved]);

  return (
    <div
      className={`rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all duration-400 ${
        saved ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={profile.image_url}
          alt={profile.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-3 space-y-3">
        {/* Name & meta */}
        <div>
          <p className="font-semibold text-sm text-foreground truncate">{profile.name}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            ID: {profile._id}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Col: {profile._collection}
          </p>
        </div>

        {/* Dropdowns */}
        <div className="space-y-2">
          {FIELDS.map((field) => {
            const isEmpty = values[field.key] === "";
            return (
              <div key={field.key}>
                <label className="text-[11px] font-medium text-muted-foreground mb-0.5 block">
                  {field.label}
                </label>
                <Select
                  value={values[field.key]}
                  onValueChange={(v) =>
                    setValues((prev) => ({ ...prev, [field.key]: v }))
                  }
                >
                  <SelectTrigger
                    className={`h-8 text-xs ${
                      isEmpty ? "border-destructive/50 ring-1 ring-destructive/20" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-xs">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* Save */}
        <Button
          size="sm"
          className="w-full gap-1.5"
          disabled={!allFilled || saving}
          onClick={handleSave}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
