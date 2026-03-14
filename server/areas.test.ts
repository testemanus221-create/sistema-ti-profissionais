import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock de contexto para usuário admin
function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// Mock de contexto para usuário comum
function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// Gerar UF aleatório único (2 letras)
function generateUniqueUF(): string {
  const char1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const char2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${char1}${char2}`;
}

describe("Areas Management", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let userCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    adminCaller = appRouter.createCaller(createAdminContext());
    userCaller = appRouter.createCaller(createUserContext());
  });

  it("should list areas (public)", async () => {
    const areas = await adminCaller.areas.list();
    expect(Array.isArray(areas)).toBe(true);
  });

  it("should create area as admin", async () => {
    const timestamp = Date.now();
    const area = await adminCaller.areas.create({
      nome_area: `Redes ${timestamp}`,
    });
    expect(area).toBeDefined();
    expect(area.nome_area).toContain("Redes");
  });

  it("should not create area as regular user", async () => {
    try {
      await userCaller.areas.create({
        nome_area: `Suporte ${Date.now()}`,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should update area as admin", async () => {
    const timestamp = Date.now();
    const created = await adminCaller.areas.create({
      nome_area: `Desenvolvimento ${timestamp}`,
    });

    const updated = await adminCaller.areas.update({
      id: created.id,
      nome_area: `Desenvolvimento Web ${timestamp}`,
    });

    expect(updated.nome_area).toContain("Desenvolvimento Web");
  });

  it("should delete area as admin", async () => {
    const timestamp = Date.now();
    const created = await adminCaller.areas.create({
      nome_area: `Infraestrutura ${timestamp}`,
    });

    const result = await adminCaller.areas.delete({
      id: created.id,
    });

    expect(result.success).toBe(true);
  });

  it("should not delete area as regular user", async () => {
    const timestamp = Date.now();
    const created = await adminCaller.areas.create({
      nome_area: `Segurança ${timestamp}`,
    });

    try {
      await userCaller.areas.delete({
        id: created.id,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }

    // Cleanup
    await adminCaller.areas.delete({ id: created.id });
  });
});

describe("Estados Management", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    adminCaller = appRouter.createCaller(createAdminContext());
  });

  it("should create estado as admin", async () => {
    const timestamp = Date.now();
    const uf = generateUniqueUF();
    const estado = await adminCaller.estados.create({
      nome_estado: `São Paulo ${timestamp}`,
      uf: uf,
    });
    expect(estado).toBeDefined();
    expect(estado.nome_estado).toContain("São Paulo");
  });

  it("should list estados", async () => {
    const estados = await adminCaller.estados.list();
    expect(Array.isArray(estados)).toBe(true);
  });

  it("should update estado", async () => {
    const timestamp = Date.now();
    const uf = generateUniqueUF();
    const created = await adminCaller.estados.create({
      nome_estado: `Minas Gerais ${timestamp}`,
      uf: uf,
    });

    const updated = await adminCaller.estados.update({
      id: created.id,
      nome_estado: `Minas Gerais ${timestamp}`,
      uf: uf,
    });

    expect(updated.uf).toBe(uf);
  });
});

describe("Cidades Management", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let estadoId: number;

  beforeAll(async () => {
    adminCaller = appRouter.createCaller(createAdminContext());
    const timestamp = Date.now();
    const uf = generateUniqueUF();
    const estado = await adminCaller.estados.create({
      nome_estado: `Rio de Janeiro ${timestamp}`,
      uf: uf,
    });
    estadoId = estado.id;
  });

  it("should create cidade as admin", async () => {
    const timestamp = Date.now();
    const cidade = await adminCaller.cidades.create({
      estado_id: estadoId,
      nome_cidade: `Rio de Janeiro ${timestamp}`,
    });
    expect(cidade).toBeDefined();
    expect(cidade.nome_cidade).toContain("Rio de Janeiro");
  });

  it("should list cidades by estado", async () => {
    const cidades = await adminCaller.cidades.list({
      estado_id: estadoId,
    });
    expect(Array.isArray(cidades)).toBe(true);
  });
});

describe("Municipios Management", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let cidadeId: number;

  beforeAll(async () => {
    adminCaller = appRouter.createCaller(createAdminContext());
    const timestamp = Date.now();
    const uf = generateUniqueUF();
    const estado = await adminCaller.estados.create({
      nome_estado: `Bahia ${timestamp}`,
      uf: uf,
    });
    const cidade = await adminCaller.cidades.create({
      estado_id: estado.id,
      nome_cidade: `Salvador ${timestamp}`,
    });
    cidadeId = cidade.id;
  });

  it("should create municipio as admin", async () => {
    const timestamp = Date.now();
    const municipio = await adminCaller.municipios.create({
      cidade_id: cidadeId,
      nome_municipio: `Salvador Municipio ${timestamp}`,
    });
    expect(municipio).toBeDefined();
    expect(municipio.nome_municipio).toContain("Salvador Municipio");
  });

  it("should list municipios by cidade", async () => {
    const municipios = await adminCaller.municipios.list({
      cidade_id: cidadeId,
    });
    expect(Array.isArray(municipios)).toBe(true);
  });
});
