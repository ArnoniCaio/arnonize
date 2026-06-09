# Arnonize — Contexto do Projeto

## Stack
- Frontend: React + Vite + TypeScript
- Estilo: Tailwind CSS + design system próprio (dark, acento #6366f1)
- Banco: Supabase (PostgreSQL) — projeto: zrzrdpcgamidmsdyzqsm
- Auth: Supabase Auth (email/senha) + RLS ativo
- Deploy: Vercel
- Fontes/ícones: DM Sans + Tabler Icons (cdn)

## Módulos implementados
- Agenda: eventos, tarefas, hábitos — CRUD completo, swipe actions, detalhes, calendário mensal
- Finanças: contas, transações, recorrentes, gráficos — CRUD completo
- Saúde: check-in diário com histórico, treino ativo com fichas, métricas corporais

## Módulos pendentes
- Dashboard central (visão consolidada + análises cross-módulo)
- Metas & OKRs
- Cultura & Entretenimento
- Hobbies
- Aprendizado
- Notificações Web Push
- Diário alimentar (TACO + Open Food Facts)

## Padrões de código
- Componentes em src/components/<modulo>/
- Hooks em src/hooks/use<Modulo>.ts
- Tipos em src/types/<modulo>.ts
- Páginas em src/pages/<modulo>/
- UI reutilizável: BottomSheet, SwipeableRow, FormField
- Todas as telas são mobile-first, bottom nav com drawer para módulos extras
- Swipe para editar/excluir, tap para detalhes

## Decisões importantes
- Sem multitenancy — app pessoal de uso único
- RLS ativo com política "authenticated" em todas as tabelas
- PWA instalável no iPhone (iOS 16.4+)
- Transações recorrentes confirmadas manualmente
- Treino ativo em memória, salvo ao concluir
- Métricas corporais: peso, cintura, quadril, peito, braço, coxa