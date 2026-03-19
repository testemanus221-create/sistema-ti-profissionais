# Sistema de Gerenciamento de Profissionais de TI - TODO

## Banco de Dados
- [x] Criar tabela usuarios (id, nome, email, senha, tipo, createdAt, updatedAt)
- [x] Criar tabela areas (id, nome_area)
- [x] Criar tabela estados (id, nome_estado)
- [x] Criar tabela cidades (id, estado_id, nome_cidade)
- [x] Criar tabela municipios (id, cidade_id, nome_municipio)
- [x] Criar tabela tecnicos (id, usuario_id, area_id, estado_id, cidade_id, whatsapp, email, disponivel)
- [x] Criar tabela tecnico_municipios (id, tecnico_id, municipio_id)
- [x] Executar migrações SQL

## Backend - Autenticação
- [x] Implementar login com dois níveis (ADMIN e TECNICO)
- [x] Implementar logout
- [x] Implementar registro de técnico
- [x] Implementar proteção de rotas (protectedProcedure)

## Backend - Áreas de Atuação
- [x] Criar rota para listar áreas
- [x] Criar rota para criar área (ADMIN only)
- [x] Criar rota para editar área (ADMIN only)
- [x] Criar rota para deletar área (ADMIN only)

## Backend - Localizações
- [x] Criar rota para listar estados
- [x] Criar rota para criar estado (ADMIN only)
- [x] Criar rota para editar estado (ADMIN only)
- [x] Criar rota para deletar estado (ADMIN only)
- [x] Criar rota para listar cidades por estado
- [x] Criar rota para criar cidade (ADMIN only)
- [x] Criar rota para editar cidade (ADMIN only)
- [x] Criar rota para deletar cidade (ADMIN only)
- [x] Criar rota para listar municípios por cidade
- [x] Criar rota para criar município (ADMIN only)
- [x] Criar rota para editar município (ADMIN only)
- [x] Criar rota para deletar município (ADMIN only)

## Backend - Técnicos
- [x] Criar rota para listar técnicos (com filtros)
- [x] Criar rota para obter técnico por ID
- [x] Criar rota para atualizar dados do técnico (TECNICO - próprios dados)
- [x] Criar rota para alternar disponibilidade (TECNICO)
- [x] Criar rota para deletar técnico (ADMIN)
- [x] Implementar filtros: estado, cidade, município, área, disponibilidade

## Frontend - Autenticação
- [x] Criar página de login
- [x] Criar página de cadastro de técnico
- [x] Implementar fluxo de autenticação

## Frontend - Painel Admin
- [x] Criar layout do painel admin com sidebar
- [x] Criar página de gerenciamento de áreas (CRUD)
- [x] Criar página de gerenciamento de estados (CRUD)
- [x] Criar página de gerenciamento de cidades (CRUD)
- [x] Criar página de gerenciamento de municípios (CRUD)
- [x] Criar página de lista de profissionais com tabela
- [x] Implementar filtros dinâmicos na lista de profissionais
- [x] Implementar botão de contato WhatsApp

## Frontend - Dashboard do Técnico
- [x] Criar página de dashboard do técnico
- [x] Implementar edição de dados pessoais
- [x] Implementar toggle de disponibilidade
- [x] Implementar validações de formulário

## Frontend - Página Pública
- [x] Criar página inicial/landing
- [x] Criar página pública de lista de profissionais
- [x] Implementar filtros na página pública
- [x] Implementar botão de contato WhatsApp

## UI/UX
- [x] Aplicar design elegante e responsivo
- [x] Implementar máscaras de formatação (WhatsApp, email)
- [x] Implementar validações em todos os campos
- [x] Implementar feedback visual (toasts, loading states)
- [x] Testar responsividade em dispositivos móveis

## Testes
- [x] Escrever testes unitários para autenticação
- [x] Escrever testes para CRUD de áreas
- [x] Escrever testes para CRUD de localizações
- [x] Escrever testes para CRUD de técnicos
- [ ] Testar filtros dinâmicos

## Deployment
- [x] Verificar todas as funcionalidades
- [ ] Corrigir bugs encontrados
- [ ] Popular dados iniciais (estados, cidades, etc)
- [x] Criar checkpoint final
- [ ] Entregar sistema funcional


## Bugs Encontrados
- [x] Corrigir erro de controlled/uncontrolled input no TecnicoDashboard
- [x] Corrigir rota /dashboard retornando 404


## Ajustes de Visibilidade (Nova Requisição)
- [x] Remover busca de técnicos da tela pública
- [x] Remover lista de profissionais da tela pública
- [x] Deixar tela pública com apenas login, cadastro e informações básicas
- [x] Mover busca de técnicos para painel admin
- [x] Implementar verificação de permissão para acesso ao painel admin
- [x] Impedir técnicos de ver outros técnicos
- [x] Impedir técnicos de usar busca de profissionais
- [x] Corrigir painel admin que não está abrindo
- [x] Corrigir rota /admin retornando 404
- [x] Corrigir tremor/flickering na tela do painel admin
- [x] Corrigir queries infinitas na aba de áreas de atuação
- [x] Corrigir travamento completo do painel admin (ciclo infinito de auth.me)
- [x] Popular banco com áreas de atuação reais de TI
- [x] Popular banco com estados brasileiros reais
- [x] Popular banco com cidades e municípios reais
- [x] Corrigir erro ao deletar estado com cidades relacionadas
- [x] Corrigir página de cadastro de técnico exigindo autenticação
- [x] Implementar sistema completo de cadastro com senha para técnico
- [x] Adicionar campo de senha no formulário de registro
- [x] Implementar autenticação por email/senha
- [x] Criar função de login por email/senha
- [x] Corrigir erro de controlled/uncontrolled input no Register.tsx
- [x] Corrigir redirecionamento após cadastro de técnico (404 no /dashboard)
- [x] Corrigir erro de INSERT ao cadastrar técnico (campo name incompleto)
- [x] Corrigir erro de login "Email ou senha incorretos"
- [x] Corrigir erro de login "Email ou senha incorretos" (hash não bate)
- [x] Corrigir erro de cadastro com email duplicado (constraint UNIQUE não está sendo capturada)
- [x] Limpar dados de teste do banco de dados
- [x] Debugar erro de login "Email ou senha incorretos" - verificar fluxo cadastro/login
- [x] Corrigir redirecionamento após login bem-sucedido do técnico (404)
- [x] Corrigir JWT do loginEmail para incluir appId e name (erro de autenticação)
- [x] Adicionar testes para o fluxo de login com email/senha


## Nova Requisição - Dashboard do Técnico Completo
- [x] Criar página de dashboard do técnico com layout profissional
- [x] Exibir informações básicas do técnico (nome, email, área, localização, WhatsApp)
- [x] Implementar edição de informações pessoais (apenas próprios dados)
- [x] Implementar toggle de disponibilidade (on/off)
- [x] Sincronizar disponibilidade com a lista de profissionais do painel admin
- [x] Quando disponível (on), técnico aparece na lista do admin
- [x] Quando indisponível (off), técnico desaparece da lista do admin
- [x] Testar fluxo completo: editar dados, toggle disponibilidade, verificar lista admin
- [x] Corrigir cookie do loginEmail para usar serialize() com opcoes corretas


## Nova Requisição - Sistema de Recuperação de Senha
- [x] Criar tabela de reset tokens no banco de dados
- [x] Implementar rota de requisição de reset (enviar código por email)
- [x] Implementar rota de validação de código
- [x] Implementar rota de reset de senha
- [x] Criar página "Esqueci minha senha"
- [x] Criar página de confirmação de código
- [x] Criar página de reset de senha
- [x] Integrar envio de email com código de confirmação
- [x] Adicionar botão "Esqueci minha senha" na página de login
- [ ] Testar fluxo completo de recuperação de senha


## Nova Requisição - Configuração de Email de Origem no Admin
- [x] Criar tabela de configurações do sistema
- [x] Adicionar campo de email de origem (sender email)
- [x] Implementar rotas backend para gerenciar configurações
- [x] Criar UI no painel admin para configurar email
- [x] Atualizar função de envio de email para usar email configurado
- [x] Testar envio de email com email configurado


## Bug - Envio de Email de Recuperação de Senha
- [x] Investigar por que o email não está sendo enviado
- [x] Corrigir endpoint URL com barra inicial no path
- [x] Melhorar logging de erros para debug
- [x] Adicionar validação de email_sender configurado
- [x] Retornar erro ao usuário se email falhar
- [x] Testar fluxo completo: configurar email → solicitar reset → verificar se código chega
