import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { sdk } from "./_core/sdk";

// Middleware para verificar se é admin
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado. Apenas administradores.' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    loginEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        senha: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Email ou senha incorretos',
          });
        }

        const crypto = await import('crypto');
        const senhaHash = crypto.createHash('sha256').update(input.senha).digest('hex');
        if (user.passwordHash !== senhaHash) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Email ou senha incorretos',
          });
        }

            // Usar sdk.createSessionToken para criar um JWT válido
        const token = await sdk.createSessionToken(user.openId, { name: user.name || '' });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const cookieModule = await import('cookie');
        const serialize = (cookieModule as any).serialize;
        const cookieHeader = serialize(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        ctx.res.setHeader('Set-Cookie', cookieHeader);
        
        return { success: true, user };
      }),
  }),

  // ============ AREAS ============
  areas: router({
    list: publicProcedure.query(async () => {
      return db.getAreas();
    }),

    create: adminProcedure
      .input(z.object({ nome_area: z.string().min(1, "Nome da área é obrigatório") }))
      .mutation(async ({ input }) => {
        try {
          return await db.createArea(input.nome_area);
        } catch (error: any) {
          if (error.message?.includes('UNIQUE')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Essa área de atuação já existe',
            });
          }
          throw error;
        }
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome_area: z.string().min(1, "Nome da área é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.updateArea(input.id, input.nome_area);
        } catch (error: any) {
          if (error.message?.includes('UNIQUE')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Essa área de atuação já existe',
            });
          }
          throw error;
        }
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteArea(input.id);
        return { success: true };
      }),
  }),

  // ============ ESTADOS ============
  estados: router({
    list: publicProcedure.query(async () => {
      return db.getEstados();
    }),

    create: adminProcedure
      .input(z.object({
        nome_estado: z.string().min(1, "Nome do estado é obrigatório"),
        uf: z.string().length(2, "UF deve ter 2 caracteres").toUpperCase(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.createEstado(input.nome_estado, input.uf);
        } catch (error: any) {
          if (error.message?.includes('UNIQUE')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Esse estado ou UF já existe',
            });
          }
          throw error;
        }
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        nome_estado: z.string().min(1, "Nome do estado é obrigatório"),
        uf: z.string().length(2, "UF deve ter 2 caracteres").toUpperCase(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.updateEstado(input.id, input.nome_estado, input.uf);
        } catch (error: any) {
          if (error.message?.includes('UNIQUE')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Esse estado ou UF já existe',
            });
          }
          throw error;
        }
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEstado(input.id);
        return { success: true };
      }),
  }),

  // ============ CIDADES ============
  cidades: router({
    list: publicProcedure
      .input(z.object({ estado_id: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getCidades(input?.estado_id);
      }),

    create: adminProcedure
      .input(z.object({
        estado_id: z.number(),
        nome_cidade: z.string().min(1, "Nome da cidade é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        return await db.createCidade(input.estado_id, input.nome_cidade);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        estado_id: z.number(),
        nome_cidade: z.string().min(1, "Nome da cidade é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        return await db.updateCidade(input.id, input.estado_id, input.nome_cidade);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCidade(input.id);
        return { success: true };
      }),
  }),

  // ============ MUNICIPIOS ============
  municipios: router({
    list: publicProcedure
      .input(z.object({ cidade_id: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return db.getMunicipios(input?.cidade_id);
      }),

    create: adminProcedure
      .input(z.object({
        cidade_id: z.number(),
        nome_municipio: z.string().min(1, "Nome do município é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        return await db.createMunicipio(input.cidade_id, input.nome_municipio);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        cidade_id: z.number(),
        nome_municipio: z.string().min(1, "Nome do município é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        return await db.updateMunicipio(input.id, input.cidade_id, input.nome_municipio);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMunicipio(input.id);
        return { success: true };
      }),
  }),

  // ============ TECNICOS ============
  tecnicos: router({
    // Listar técnicos disponíveis com filtros (público)
    listDisponibles: publicProcedure
      .input(z.object({
        area_id: z.number().optional(),
        estado_id: z.number().optional(),
        cidade_id: z.number().optional(),
        municipio_id: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const tecnicos = await db.getTecnicosDisponiveis(input);
        // Enriquecer com dados relacionados
        return Promise.all(tecnicos.map(async (tecnico) => {
          const area = await db.getAreaById(tecnico.area_id);
          const estado = await db.getEstadoById(tecnico.estado_id);
          const cidade = await db.getCidadeById(tecnico.cidade_id);
          const municipios = await db.getTecnicoMunicipios(tecnico.id);
          return {
            ...tecnico,
            area: area?.nome_area,
            estado: estado?.nome_estado,
            cidade: cidade?.nome_cidade,
            municipios: municipios.map(m => m.nome_municipio),
          };
        }));
      }),

    // Obter dados do técnico logado
    me: protectedProcedure.query(async ({ ctx }) => {
      const tecnico = await db.getTecnicoByUsuarioId(ctx.user.id);
      if (!tecnico) return null;

      const area = await db.getAreaById(tecnico.area_id);
      const estado = await db.getEstadoById(tecnico.estado_id);
      const cidade = await db.getCidadeById(tecnico.cidade_id);
      const municipios = await db.getTecnicoMunicipios(tecnico.id);

      return {
        ...tecnico,
        area: area?.nome_area,
        estado: estado?.nome_estado,
        cidade: cidade?.nome_cidade,
        municipios: municipios.map(m => ({ id: m.id, nome: m.nome_municipio })),
      };
    }),

    // Criar novo técnico (durante cadastro)
    create: publicProcedure
      .input(z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
        email: z.string().email("Email inválido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
        area_id: z.number(),
        estado_id: z.number(),
        cidade_id: z.number(),
        whatsapp: z.string().min(10, "WhatsApp inválido"),
        municipios_ids: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await db.createTecnicoPublic(
            input.nome,
            input.email,
            input.senha,
            input.area_id,
            input.estado_id,
            input.cidade_id,
            input.whatsapp,
            input.municipios_ids,
          );
        } catch (error: any) {
          console.error('[Cadastro Erro]', error);
          const errorMsg = String(error.message || error.toString()).toLowerCase();
          if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('email') || errorMsg.includes('constraint')) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Este email já está cadastrado. Faça login para continuar.',
            });
          }
          throw error;
        }
      }),

    // Atualizar dados do técnico (apenas próprios dados)
    update: protectedProcedure
      .input(z.object({
        area_id: z.number().optional(),
        estado_id: z.number().optional(),
        cidade_id: z.number().optional(),
        whatsapp: z.string().min(10, "WhatsApp inválido").optional(),
        email: z.string().email("Email inválido").optional(),
        municipios_ids: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tecnico = await db.getTecnicoByUsuarioId(ctx.user.id);
        if (!tecnico) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Técnico não encontrado',
          });
        }

        return await db.updateTecnico(tecnico.id, input);
      }),

    // Alternar disponibilidade
    toggleDisponibilidade: protectedProcedure.mutation(async ({ ctx }) => {
      const tecnico = await db.getTecnicoByUsuarioId(ctx.user.id);
      if (!tecnico) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Técnico não encontrado',
        });
      }

      return await db.updateTecnico(tecnico.id, {
        disponivel: !tecnico.disponivel,
      });
    }),

    // Deletar técnico (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTecnico(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
