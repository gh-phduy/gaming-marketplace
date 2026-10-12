import { z } from "zod";
import { TOPUP_GAME_DETAILS } from "@/components/home/directtopup/detail/topup-detail-data";

export type TopUpSelection = {
  gameSlug: string;
  packageId: string;
  fields: Record<string, string>;
};

export function findTopUpPackage(packageId: string) {
  for (const game of Object.values(TOPUP_GAME_DETAILS)) {
    const item = game.packages.find(item => item.id === packageId);
    if (item) return { game, item };
  }
  return null;
}

export function validateTopUpSelection(input: unknown) {
  const selection = z.object({
    gameSlug: z.string().min(1).max(100),
    packageId: z.string().min(1).max(100),
    fields: z.record(z.string().trim().min(1).max(100)),
  }).strict().parse(input);
  const selected = findTopUpPackage(selection.packageId);
  if (!selected || selected.game.slug !== selection.gameSlug) throw new Error("Choose an available top-up package.");
  for (const field of selected.game.inputs) {
    if (!selection.fields[field.id]) throw new Error(`Please enter ${field.label}.`);
  }
  if (Object.keys(selection.fields).some(id => !selected.game.inputs.some(field => field.id === id))) {
    throw new Error("Invalid player details.");
  }
  return { ...selected, selection };
}
