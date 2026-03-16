"use client";

import { useState } from "react";
import { createDish, updateDish, deleteDish } from "@/lib/actions/dishes";
import { useRouter } from "next/navigation";

interface AdminDishFormProps {
  date: string;
  existingDish?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
}

export function AdminDishForm({ date, existingDish }: AdminDishFormProps) {
  const [isEditing, setIsEditing] = useState(!existingDish);
  const [name, setName] = useState(existingDish?.name ?? "");
  const [description, setDescription] = useState(
    existingDish?.description ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isEditing && existingDish) {
    return (
      <div className="flex gap-2 pt-2 border-t border-charcoal/5">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gold hover:text-gold-dark underline underline-offset-4 transition-colors"
        >
          Bearbeiten
        </button>
        <button
          onClick={async () => {
            if (confirm("Gericht wirklich löschen?")) {
              await deleteDish(existingDish.id);
              router.refresh();
            }
          }}
          className="text-xs text-red-400 hover:text-red-600 underline underline-offset-4 transition-colors"
        >
          Löschen
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    let imageUrl = existingDish?.imageUrl ?? undefined;

    // Upload image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        imageUrl = data.url;
      }
    }

    if (existingDish) {
      await updateDish(existingDish.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl,
      });
    } else {
      await createDish({
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl,
        date,
      });
    }

    setLoading(false);
    setIsEditing(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Gerichtname"
        className="w-full px-3 py-2 rounded-lg border border-charcoal/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beschreibung (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-charcoal/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
        className="w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-charcoal/5 file:text-charcoal hover:file:bg-charcoal/10 file:cursor-pointer"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs font-medium hover:bg-charcoal-light transition-colors disabled:opacity-50"
        >
          {loading ? "..." : existingDish ? "Speichern" : "Hinzufügen"}
        </button>
        {existingDish && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setName(existingDish.name);
              setDescription(existingDish.description ?? "");
            }}
            className="px-4 py-2 rounded-lg text-xs text-muted hover:text-charcoal transition-colors"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}
