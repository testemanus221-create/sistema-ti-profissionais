import { eq, and, desc, inArray, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  areas,
  estados,
  cidades,
  municipios,
  tecnicos,
  tecnico_municipios,
  passwordResetTokens,
  type Area,
  type Estado,
  type Cidade,
  type Municipio,
  type Tecnico,
  type TecnicoMunicipio,
  type PasswordResetToken,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ AREAS ============

export async function getAreas(): Promise<Area[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(areas).orderBy(areas.nome_area);
}

export async function getAreaById(id: number): Promise<Area | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(areas).where(eq(areas.id, id)).limit(1);
  return result[0];
}

export async function createArea(nome_area: string): Promise<Area> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(areas).values({ nome_area });
  const id = result[0].insertId as number;
  return getAreaById(id) as Promise<Area>;
}

export async function updateArea(id: number, nome_area: string): Promise<Area> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(areas).set({ nome_area }).where(eq(areas.id, id));
  return getAreaById(id) as Promise<Area>;
}

export async function deleteArea(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(areas).where(eq(areas.id, id));
}

// ============ ESTADOS ============

export async function getEstados(): Promise<Estado[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(estados).orderBy(estados.nome_estado);
}

export async function getEstadoById(id: number): Promise<Estado | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(estados).where(eq(estados.id, id)).limit(1);
  return result[0];
}

export async function createEstado(nome_estado: string, uf: string): Promise<Estado> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(estados).values({ nome_estado, uf });
  const id = result[0].insertId as number;
  return getEstadoById(id) as Promise<Estado>;
}

export async function updateEstado(id: number, nome_estado: string, uf: string): Promise<Estado> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(estados).set({ nome_estado, uf }).where(eq(estados.id, id));
  return getEstadoById(id) as Promise<Estado>;
}

export async function deleteEstado(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se há cidades relacionadas
  const cidadesRelacionadas = await db.select().from(cidades).where(eq(cidades.estado_id, id)).limit(1);
  if (cidadesRelacionadas.length > 0) {
    throw new Error("Não é possível deletar este estado pois existem cidades relacionadas. Remova as cidades primeiro.");
  }
  
  await db.delete(estados).where(eq(estados.id, id));
}

// ============ CIDADES ============

export async function getCidades(estado_id?: number): Promise<Cidade[]> {
  const db = await getDb();
  if (!db) return [];
  if (estado_id) {
    return db.select().from(cidades).where(eq(cidades.estado_id, estado_id)).orderBy(cidades.nome_cidade);
  }
  return db.select().from(cidades).orderBy(cidades.nome_cidade);
}

export async function getCidadeById(id: number): Promise<Cidade | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(cidades).where(eq(cidades.id, id)).limit(1);
  return result[0];
}

export async function createCidade(estado_id: number, nome_cidade: string): Promise<Cidade> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cidades).values({ estado_id, nome_cidade });
  const id = result[0].insertId as number;
  return getCidadeById(id) as Promise<Cidade>;
}

export async function updateCidade(id: number, estado_id: number, nome_cidade: string): Promise<Cidade> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cidades).set({ estado_id, nome_cidade }).where(eq(cidades.id, id));
  return getCidadeById(id) as Promise<Cidade>;
}

export async function deleteCidade(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verificar se há municípios relacionados
  const municipiosRelacionados = await db.select().from(municipios).where(eq(municipios.cidade_id, id)).limit(1);
  if (municipiosRelacionados.length > 0) {
    throw new Error("Não é possível deletar esta cidade pois existem municípios relacionados. Remova os municípios primeiro.");
  }
  
  await db.delete(cidades).where(eq(cidades.id, id));
}

// ============ MUNICIPIOS ============

export async function getMunicipios(cidade_id?: number): Promise<Municipio[]> {
  const db = await getDb();
  if (!db) return [];
  if (cidade_id) {
    return db.select().from(municipios).where(eq(municipios.cidade_id, cidade_id)).orderBy(municipios.nome_municipio);
  }
  return db.select().from(municipios).orderBy(municipios.nome_municipio);
}

export async function getMunicipioById(id: number): Promise<Municipio | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(municipios).where(eq(municipios.id, id)).limit(1);
  return result[0];
}

export async function createMunicipio(cidade_id: number, nome_municipio: string): Promise<Municipio> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(municipios).values({ cidade_id, nome_municipio });
  const id = result[0].insertId as number;
  return getMunicipioById(id) as Promise<Municipio>;
}

export async function updateMunicipio(id: number, cidade_id: number, nome_municipio: string): Promise<Municipio> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(municipios).set({ cidade_id, nome_municipio }).where(eq(municipios.id, id));
  return getMunicipioById(id) as Promise<Municipio>;
}

export async function deleteMunicipio(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(municipios).where(eq(municipios.id, id));
}

// ============ TECNICOS ============

export async function getTecnicoByUsuarioId(usuario_id: number): Promise<Tecnico | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tecnicos).where(eq(tecnicos.usuario_id, usuario_id)).limit(1);
  return result[0];
}

export async function getTecnicoById(id: number): Promise<Tecnico | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tecnicos).where(eq(tecnicos.id, id)).limit(1);
  return result[0];
}

export async function getTecnicosDisponiveis(filters?: {
  area_id?: number;
  estado_id?: number;
  cidade_id?: number;
  municipio_id?: number;
}): Promise<Tecnico[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(tecnicos.disponivel, true)];

  if (filters?.area_id) {
    conditions.push(eq(tecnicos.area_id, filters.area_id));
  }
  if (filters?.estado_id) {
    conditions.push(eq(tecnicos.estado_id, filters.estado_id));
  }
  if (filters?.cidade_id) {
    conditions.push(eq(tecnicos.cidade_id, filters.cidade_id));
  }

  const result = await db.select().from(tecnicos).where(and(...conditions)).orderBy(desc(tecnicos.createdAt));

  // Se há filtro de município, fazer segunda filtragem
  if (filters?.municipio_id) {
    const tecnicosComMunicipio = await db
      .select({ tecnico_id: tecnico_municipios.tecnico_id })
      .from(tecnico_municipios)
      .where(eq(tecnico_municipios.municipio_id, filters.municipio_id));

    const ids = tecnicosComMunicipio.map(t => t.tecnico_id);
    return result.filter(t => ids.includes(t.id));
  }

  return result;
}

export async function createTecnicoPublic(
  nome: string,
  email: string,
  senha: string,
  area_id: number,
  estado_id: number,
  cidade_id: number,
  whatsapp: string,
  municipios_ids?: number[]
): Promise<Tecnico> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hash da senha (usar bcrypt em produção)
  const crypto = await import('crypto');
  const passwordHash = crypto.createHash('sha256').update(senha).digest('hex');
  
  // Criar usuário com dados do técnico
  const normalizedEmail = email.toLowerCase().trim();
  const userResult = await db.insert(users).values({
    openId: `tecnico-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    name: nome,
    email: normalizedEmail,
    passwordHash: passwordHash,
    loginMethod: 'email',
    role: 'user',
  });
  const userId = userResult[0].insertId as number;
  
  // Criar técnico
  const result = await db.insert(tecnicos).values({
    usuario_id: userId,
    area_id,
    estado_id,
    cidade_id,
    whatsapp,
    email,
    disponivel: true,
  });
  const tecnico_id = result[0].insertId as number;
  
  // Adicionar municípios se fornecidos
  if (municipios_ids && municipios_ids.length > 0) {
    await db.insert(tecnico_municipios).values(
      municipios_ids.map(municipio_id => ({ tecnico_id, municipio_id }))
    );
  }
  
  return getTecnicoById(tecnico_id) as Promise<Tecnico>;
}

export async function createTecnico(
  usuario_id: number,
  area_id: number,
  estado_id: number,
  cidade_id: number,
  whatsapp: string,
  email: string,
  municipios_ids?: number[]
): Promise<Tecnico> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tecnicos).values({
    usuario_id,
    area_id,
    estado_id,
    cidade_id,
    whatsapp,
    email,
    disponivel: true,
  });

  const tecnico_id = result[0].insertId as number;

  // Adicionar municípios se fornecidos
  if (municipios_ids && municipios_ids.length > 0) {
    await db.insert(tecnico_municipios).values(
      municipios_ids.map(municipio_id => ({ tecnico_id, municipio_id }))
    );
  }

  return getTecnicoById(tecnico_id) as Promise<Tecnico>;
}

export async function updateTecnico(
  id: number,
  updates: {
    area_id?: number;
    estado_id?: number;
    cidade_id?: number;
    whatsapp?: string;
    email?: string;
    disponivel?: boolean;
    municipios_ids?: number[];
  }
): Promise<Tecnico> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  if (updates.area_id !== undefined) updateData.area_id = updates.area_id;
  if (updates.estado_id !== undefined) updateData.estado_id = updates.estado_id;
  if (updates.cidade_id !== undefined) updateData.cidade_id = updates.cidade_id;
  if (updates.whatsapp !== undefined) updateData.whatsapp = updates.whatsapp;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.disponivel !== undefined) updateData.disponivel = updates.disponivel;

  if (Object.keys(updateData).length > 0) {
    await db.update(tecnicos).set(updateData).where(eq(tecnicos.id, id));
  }

  // Atualizar municípios se fornecidos
  if (updates.municipios_ids !== undefined) {
    // Deletar municípios antigos
    await db.delete(tecnico_municipios).where(eq(tecnico_municipios.tecnico_id, id));
    // Inserir novos
    if (updates.municipios_ids.length > 0) {
      await db.insert(tecnico_municipios).values(
        updates.municipios_ids.map(municipio_id => ({ tecnico_id: id, municipio_id }))
      );
    }
  }

  return getTecnicoById(id) as Promise<Tecnico>;
}

export async function deleteTecnico(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Deletar municípios primeiro
  await db.delete(tecnico_municipios).where(eq(tecnico_municipios.tecnico_id, id));
  // Depois deletar técnico
  await db.delete(tecnicos).where(eq(tecnicos.id, id));
}

export async function getTecnicoMunicipios(tecnico_id: number): Promise<Municipio[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ municipio_id: tecnico_municipios.municipio_id })
    .from(tecnico_municipios)
    .where(eq(tecnico_municipios.tecnico_id, tecnico_id));

  const municipios_ids = result.map(r => r.municipio_id);
  if (municipios_ids.length === 0) return [];

  return db.select().from(municipios).where(
    inArray(municipios.id, municipios_ids)
  );
}


// ============ PASSWORD RESET ============

export async function createPasswordResetToken(
  usuario_id: number,
  code: string
): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Gerar token único
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  
  // Expiração em 1 hora
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const result = await db.insert(passwordResetTokens).values({
    usuario_id,
    token,
    code,
    expiresAt,
  });

  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token))
    .limit(1);

  return resetToken[0];
}

export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.token, token),
      isNull(passwordResetTokens.usedAt)
    ))
    .limit(1);

  if (result.length === 0) return null;

  const resetToken = result[0];

  // Verificar se o token expirou
  if (new Date() > resetToken.expiresAt) {
    return null;
  }

  return resetToken;
}

export async function validateResetCode(
  usuario_id: number,
  code: string
): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.usuario_id, usuario_id),
      eq(passwordResetTokens.code, code),
      isNull(passwordResetTokens.usedAt)
    ))
    .limit(1);

  if (result.length === 0) return null;

  const resetToken = result[0];

  // Verificar se o token expirou
  if (new Date() > resetToken.expiresAt) {
    return null;
  }

  return resetToken;
}

export async function markResetTokenAsUsed(token_id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, token_id));
}

export async function updateUserPassword(
  usuario_id: number,
  passwordHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, usuario_id));
}
