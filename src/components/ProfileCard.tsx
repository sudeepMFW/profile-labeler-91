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
    key: "ethnicity" as const,
    label: "Ethnicity",
    options: ["white", "black", "asian", "brown"],
    getDefault: (p: Profile) => p.image_attributes?.ethnicity,
  },
  {
    key: "hair_color" as const,
    label: "Hair Color",
    options: ["black", "blonde", "white", "grey", "others"],
    getDefault: (p: Profile) => p.image_attributes?.hair?.hair_color,
  },
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
    options: ["normal", "large", "small", "none"],
    getDefault: (p: Profile) => p.image_attributes?.eye_size,
  },
  {
    key: "skin_color" as const,
    label: "Skin Color",
    options: ["white", "black", "brown", "none"],
    getDefault: (p: Profile) => p.image_attributes?.skin_color,
  },
  {
    key: "face_shape" as const,
    label: "Face Shape",
    options: ["oval", "round", "square", "diamond"],
    getDefault: (p: Profile) => p.image_attributes?.face_shape,
  },
  {
    key: "face_size" as const,
    label: "Face Size",
    options: ["large", "medium", "small"],
    getDefault: (p: Profile) => p.image_attributes?.face_size,
  },
  {
    key: "face_structure" as const,
    label: "Face Structure",
    options: ["symmetric", "asymmetric"],
    getDefault: (p: Profile) => p.image_attributes?.face_structure,
  },
  {
    key: "head_hair" as const,
    label: "Head Hair",
    options: ["present", "absent"],
    getDefault: (p: Profile) => p.image_attributes?.head_hair,
  },
  {
    key: "beard" as const,
    label: "Beard",
    options: ["stubble", "full", "goatee", "none"],
    getDefault: (p: Profile) => p.image_attributes?.beard,
  },
  {
    key: "mustache" as const,
    label: "Mustache",
    options: ["thin", "thick", "handlebar", "none"],
    getDefault: (p: Profile) => p.image_attributes?.mustache,
  },
  {
    key: "eyewear" as const,
    label: "Eyewear",
    options: ["prescription_glasses", "sunglasses", "none"],
    getDefault: (p: Profile) => p.image_attributes?.accessories?.eyewear,
  },
  {
    key: "headwear" as const,
    label: "Headwear",
    options: ["hat", "cap", "turban", "none"],
    getDefault: (p: Profile) => p.image_attributes?.accessories?.headwear,
  },
  {
    key: "eyebrow" as const,
    label: "Eyebrow",
    options: ["present", "absent", "normal"],
    getDefault: (p: Profile) => p.image_attributes?.facial_features?.Eyebrow,
  },
  {
    key: "attire" as const,
    label: "Attire",
    options: ["casual", "western", "traditional", "formal"],
    getDefault: (p: Profile) => p.image_attributes?.attire,
  },
  {
    key: "body_shape" as const,
    label: "Body Shape",
    options: ["fit", "slim", "fat", "none"],
    getDefault: (p: Profile) => p.image_attributes?.body_shape,
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
      const normalizedDef = def?.toLowerCase().replace("-", "").trim();
      init[f.key] = normalizedDef && f.options.includes(normalizedDef) ? normalizedDef : "";
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
      const user = localStorage.getItem("user") || "Unknown";
      const payload: UpdatePayload = {
        _id: profile._id,
        _collection: profile._collection,
        updated_by: user,
        ...values
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
      className={`rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all duration-400 ${saved ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
        <img
          src={profile.image_url}
          alt={profile.name}
          className="h-full w-full object-contain"
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
                    className={`h-8 text-xs ${isEmpty ? "border-destructive/50 ring-1 ring-destructive/20" : ""
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
