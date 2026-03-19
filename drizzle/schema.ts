import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  boolean,
  foreignKey
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Supports both ADMIN and TECNICO roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: text("passwordHash"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Áreas de atuação para técnicos (ex: redes, suporte, desenvolvimento, infraestrutura, segurança)
 */
export const areas = mysqlTable("areas", {
  id: int("id").autoincrement().primaryKey(),
  nome_area: varchar("nome_area", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Area = typeof areas.$inferSelect;
export type InsertArea = typeof areas.$inferInsert;

/**
 * Estados (UF)
 */
export const estados = mysqlTable("estados", {
  id: int("id").autoincrement().primaryKey(),
  nome_estado: varchar("nome_estado", { length: 255 }).notNull().unique(),
  uf: varchar("uf", { length: 2 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Estado = typeof estados.$inferSelect;
export type InsertEstado = typeof estados.$inferInsert;

/**
 * Cidades (relacionadas a Estados)
 */
export const cidades = mysqlTable("cidades", {
  id: int("id").autoincrement().primaryKey(),
  estado_id: int("estado_id").notNull(),
  nome_cidade: varchar("nome_cidade", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  estadoFk: foreignKey({
    columns: [table.estado_id],
    foreignColumns: [estados.id],
  }),
}));

export type Cidade = typeof cidades.$inferSelect;
export type InsertCidade = typeof cidades.$inferInsert;

/**
 * Municípios (relacionados a Cidades)
 */
export const municipios = mysqlTable("municipios", {
  id: int("id").autoincrement().primaryKey(),
  cidade_id: int("cidade_id").notNull(),
  nome_municipio: varchar("nome_municipio", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  cidadeFk: foreignKey({
    columns: [table.cidade_id],
    foreignColumns: [cidades.id],
  }),
}));

export type Municipio = typeof municipios.$inferSelect;
export type InsertMunicipio = typeof municipios.$inferInsert;

/**
 * Técnicos (profissionais de TI)
 * Relacionado a usuários e localizações
 */
export const tecnicos = mysqlTable("tecnicos", {
  id: int("id").autoincrement().primaryKey(),
  usuario_id: int("usuario_id").notNull().unique(),
  area_id: int("area_id").notNull(),
  estado_id: int("estado_id").notNull(),
  cidade_id: int("cidade_id").notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  disponivel: boolean("disponivel").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  usuarioFk: foreignKey({
    columns: [table.usuario_id],
    foreignColumns: [users.id],
  }),
  areaFk: foreignKey({
    columns: [table.area_id],
    foreignColumns: [areas.id],
  }),
  estadoFk: foreignKey({
    columns: [table.estado_id],
    foreignColumns: [estados.id],
  }),
  cidadeFk: foreignKey({
    columns: [table.cidade_id],
    foreignColumns: [cidades.id],
  }),
}));

export type Tecnico = typeof tecnicos.$inferSelect;
export type InsertTecnico = typeof tecnicos.$inferInsert;

/**
 * Técnico Municípios (relacionamento muitos-para-muitos)
 * Um técnico pode atender em múltiplos municípios
 */
export const tecnico_municipios = mysqlTable("tecnico_municipios", {
  id: int("id").autoincrement().primaryKey(),
  tecnico_id: int("tecnico_id").notNull(),
  municipio_id: int("municipio_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  tecnicoFk: foreignKey({
    columns: [table.tecnico_id],
    foreignColumns: [tecnicos.id],
  }),
  municipioFk: foreignKey({
    columns: [table.municipio_id],
    foreignColumns: [municipios.id],
  }),
}));

export type TecnicoMunicipio = typeof tecnico_municipios.$inferSelect;
export type InsertTecnicoMunicipio = typeof tecnico_municipios.$inferInsert;

/**
 * Password Reset Tokens
 * Armazena tokens para reset de senha com expiração
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  usuario_id: int("usuario_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  usuarioFk: foreignKey({
    columns: [table.usuario_id],
    foreignColumns: [users.id],
  }),
}));

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;


/**
 * System Configuration
 * Armazena configurações globais do sistema (ex: email de origem)
 */
export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;
