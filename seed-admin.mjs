import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

async function seedAdmin() {
  try {
    const ownerOpenId = process.env.OWNER_OPEN_ID;
    const ownerName = process.env.OWNER_NAME;

    if (!ownerOpenId || !ownerName) {
      console.error("❌ OWNER_OPEN_ID ou OWNER_NAME não configurados");
      process.exit(1);
    }

    console.log(`📝 Criando usuário admin para: ${ownerName} (${ownerOpenId})`);

    // Verificar se o usuário já existe
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.openId, ownerOpenId))
      .limit(1);

    if (existing.length > 0) {
      console.log("✅ Usuário admin já existe");
      // Atualizar para garantir que é admin
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.openId, ownerOpenId));
      console.log("✅ Confirmado como admin");
      process.exit(0);
    }

    // Criar novo usuário admin
    await db.insert(users).values({
      openId: ownerOpenId,
      name: ownerName,
      email: `admin-${Date.now()}@techconnect.local`,
      loginMethod: "oauth",
      role: "admin",
    });

    console.log("✅ Usuário admin criado com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    process.exit(1);
  }
}

seedAdmin();
