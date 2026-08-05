import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const usernameSchema = z.object({ username: z.string().min(1).max(60) });

const resetSchema = z.object({
  username: z.string().min(1).max(60),
  answerHash: z.string().min(8).max(200),
  newPassword: z.string().min(6).max(200),
});

const slug = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");

/** Returns only the recovery question for a username (no other data). */
export const getRecoveryQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => usernameSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("question")
      .eq("username_norm", slug(data.username))
      .maybeSingle();
    return { question: row?.question ?? null };
  });

/** Resets the password when the hashed recovery answer matches. */
export const resetPasswordWithAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("profiles")
      .select("id, answer_hash")
      .eq("username_norm", slug(data.username))
      .maybeSingle();

    if (!row) return { ok: false as const, error: "Usuário não encontrado." };
    if (!row.answer_hash || row.answer_hash !== data.answerHash) {
      return { ok: false as const, error: "Resposta incorreta." };
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(row.id, {
      password: data.newPassword,
    });
    if (error) return { ok: false as const, error: "Não foi possível redefinir a senha." };
    return { ok: true as const };
  });
