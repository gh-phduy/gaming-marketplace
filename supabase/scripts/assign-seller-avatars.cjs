// Assign the ten uploaded Storage avatars to the ten provisioned demo sellers.
require("@next/env").loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const artifactDir = path.join(
  process.cwd(),
  ".codex-artifacts/supabase-validation",
);
const accounts = JSON.parse(
  fs.readFileSync(path.join(artifactDir, "seller-accounts.json"), "utf8"),
);
async function main() {
  const { data: files, error: listError } = await db.storage
    .from("Image")
    .list("avt_user", { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (listError) throw listError;
  const images = files.filter(
    (file) => file.id && /\.(png|jpe?g|webp|avif)$/i.test(file.name),
  );
  if (accounts.length !== 10 || images.length !== 10)
    throw new Error("Expected exactly ten demo sellers and ten avatar images");
  const assignments = await Promise.all(
    accounts.map(async (account, index) => {
      const { data: auth, error: authError } = await db.auth.admin.getUserById(
        account.id,
      );
      if (authError) throw authError;
      if (
        auth.user.user_metadata.seed !== "marketplace-sellers-v1" ||
        auth.user.email !== account.email
      )
        throw new Error("Refusing to update a non-demo user");
      const { data: profile, error: profileError } = await db
        .from("users")
        .select("id,display_name,avatar_url")
        .eq("id", account.id)
        .single();
      if (profileError) throw profileError;
      const avatarUrl = db.storage
        .from("Image")
        .getPublicUrl(`avt_user/${images[index].name}`).data.publicUrl;
      const response = await fetch(avatarUrl, { method: "HEAD" });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.startsWith("image/")
      )
        throw new Error(`Avatar unavailable: ${images[index].name}`);
      return {
        id: account.id,
        name: profile.display_name,
        avatarUrl,
        previousAvatar: profile.avatar_url,
        previousAuthAvatar: auth.user.user_metadata.avatar_url ?? null,
        userMetadata: auth.user.user_metadata,
      };
    }),
  );
  const backupFile = path.join(artifactDir, "seller-avatars-before.json");
  if (!fs.existsSync(backupFile))
    fs.writeFileSync(
      backupFile,
      JSON.stringify(
        assignments.map(({ userMetadata, ...assignment }) => assignment),
        null,
        2,
      ),
    );
  for (const assignment of assignments) {
    const { error: authError } = await db.auth.admin.updateUserById(
      assignment.id,
      {
        user_metadata: {
          ...assignment.userMetadata,
          avatar_url: assignment.avatarUrl,
        },
      },
    );
    if (authError) throw authError;
    const { error } = await db
      .from("users")
      .update({ avatar_url: assignment.avatarUrl })
      .eq("id", assignment.id);
    if (error) throw error;
  }
  const { data: confirmed, error } = await db
    .from("users")
    .select("id,display_name,avatar_url")
    .in(
      "id",
      assignments.map((assignment) => assignment.id),
    );
  if (error) throw error;
  for (const assignment of assignments) {
    if (
      confirmed.find((profile) => profile.id === assignment.id)?.avatar_url !==
      assignment.avatarUrl
    )
      throw new Error("Public profile verification failed");
    const { data, error: authError } = await db.auth.admin.getUserById(
      assignment.id,
    );
    if (
      authError ||
      data.user.user_metadata.avatar_url !== assignment.avatarUrl
    )
      throw new Error("Auth avatar verification failed");
  }
  console.log(
    JSON.stringify(
      {
        verifiedUsers: confirmed.length,
        avatars: assignments.map(({ name, avatarUrl }) => ({
          name,
          avatarUrl,
        })),
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
