# Arcanum

Landing page do Arcanum, um tarólogo de IA. React + Vite + TypeScript.

## Internacionalização (i18n)

O projeto usa `react-i18next` + `react-router-dom` com rotas prefixadas por idioma (`/pt`, `/en`). Veja `src/i18n/`.

- **Idioma padrão: `pt` (Português do Brasil / pt-BR).** `/` redireciona para `/pt`, e é o idioma que deve orientar o tom e o vocabulário original de qualquer texto novo.
- **Idiomas suportados atualmente: `pt` e `en`.**

### Regra obrigatória

**Toda vez que uma nova implementação adicionar ou alterar texto visível ao usuário** (título, botão, label, mensagem de erro, tooltip, etc.), **as traduções devem ser adicionadas em `pt` e `en` no mesmo commit/PR** — nunca deixe uma chave faltando em um dos dois arquivos.

- Arquivos de tradução: `src/i18n/locales/pt.json` e `src/i18n/locales/en.json`.
- Nunca deixe texto hardcoded direto no JSX — sempre passe pela chave via `t('secao.chave')` (hook `useTranslation` de `react-i18next`).
- Ao adicionar uma chave nova, adicione-a nos dois arquivos, mantendo a mesma estrutura/aninhamento em ambos.
- Se um novo idioma for adicionado no futuro, ele deve cobrir 100% das chaves existentes antes de ser incluído em `SUPPORTED_LANGUAGES` (`src/i18n/constants.ts`).
