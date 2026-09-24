# SEO — o que foi encontrado e o que foi corrigido

## Varredura: o que existia antes

- `<html lang="en">` **fixo** em `index.html`, mesmo o idioma padrão do site
  sendo `pt` e a maioria das rotas servindo português. Isso é o único lugar
  de onde um leitor de tela ou um crawler tira o idioma real da página —
  estava errado em toda página `/pt/*`.
- **Título e descrição estáticos**, os mesmos em toda rota e todo idioma
  (só em inglês, mesmo nas páginas em português).
- **Sem canonical**, **sem hreflang** (`/pt` e `/en` são duas URLs
  distintas para o mesmo conteúdo — sem hreflang, buscadores podem tratar
  isso como conteúdo duplicado, ou indexar a versão errada para cada
  idioma).
- **Sem Open Graph nem Twitter Card** — links compartilhados no
  WhatsApp/Twitter/etc. não mostravam título ou descrição próprios.
- **Sem `robots.txt` e sem `sitemap.xml`**.
- **Favicon vazio** (`data:,`) — nenhum ícone aparecia na aba do navegador.
- **`/leitura` e `/entrar` seriam indexáveis** por padrão, mas não têm
  conteúdo próprio para um crawler frio: `/leitura` sem sessão redireciona
  direto para `/jogo`, e `/entrar` é uma página utilitária de login.
- **Nenhum dado estruturado** (JSON-LD).

## O que foi corrigido

- **`src/i18n/LanguageLayout.tsx`**: agora define `document.documentElement.lang`
  a cada troca de rota, sincronizado com o idioma real.
- **`src/components/Seo.tsx`** (novo): componente que cada página usa para
  definir, no idioma certo: `document.title`, `<meta name="description">`,
  `<meta name="robots">`, `<link rel="canonical">`, os `<link rel="alternate"
  hreflang="...">` para pt/en/x-default, Open Graph e Twitter Card. Tudo
  via upsert por atributo — navegar entre páginas no SPA nunca duplica tag.
  Usado em `App.tsx` (landing, com JSON-LD `WebSite`), `GameSelect.tsx`,
  `GameBoard.tsx` (com `noindex`) e `Login.tsx` (com `noindex`).
- **`index.html`**: `lang="pt"` (o padrão real do site), favicon de verdade
  (ver abaixo), `theme-color`, e o título/descrição estático agora em
  português — é o que aparece antes do JavaScript rodar e o fallback para
  quem desabilita JS.
- **`public/favicon.svg`** (novo): o mesmo glifo (círculo + traços) já usado
  no wordmark do cabeçalho, não um ícone novo inventado.
- **`public/robots.txt`** e **`public/sitemap.xml`** (novos): bloqueiam
  `/*/leitura` e `/*/entrar`, listam `/pt`, `/en`, `/pt/jogo`, `/en/jogo`
  com os `hreflang` cruzados.

## O que ainda precisa de uma decisão ou um dado seu

1. **Domínio de produção**: `sitemap.xml` e `robots.txt` são gerados no
   build por `plugins/sitemap.ts`, a partir da lista de rotas indexáveis
   (`/`, `/jogo`, `/precos`, em cada idioma de `SUPPORTED_LANGUAGES`). O
   domínio vem de `SITE_URL` (ex.: `SITE_URL=https://arcanum.com.br`, no
   `.env.local` ou nas variáveis de ambiente da Vercel); sem ela, na Vercel
   é usado `VERCEL_PROJECT_PRODUCTION_URL`. Se nenhuma estiver definida, o
   build avisa e não gera o sitemap. Ao criar uma página nova indexável,
   adicione o `path` dela em `INDEXABLE_PATHS`.
2. **Imagem para Open Graph** (`og:image`): não adicionei nenhuma — o
   projeto não tem uma imagem de preview social de verdade ainda, e usar
   um placeholder inventado seria pior do que não ter nenhuma (o link
   compartilhado mostra só texto, o que já é uma melhoria sobre o estado
   anterior). Quando tiver uma imagem real (1200×630px é o tamanho
   recomendado), me avise para eu adicionar a tag.
3. **Renderização client-side**: o app é um SPA (React puro, sem SSR/
   pré-renderização). Google e Bing executam JavaScript e conseguem indexar
   o conteúdo mesmo assim, mas o HTML que chega "cru" pra qualquer crawler
   que não executa JS é uma casca vazia com só o título/descrição
   estáticos do `index.html`. Isso é uma limitação da arquitetura atual,
   não algo que este componente de SEO resolve — se isso importar
   (compartilhamento em redes que não renderizam JS, crawlers mais
   simples), a solução é pré-renderização ou SSR, que é uma mudança de
   arquitetura maior e separada deste trabalho.

## Palavras-chave e pré-renderização do `<head>`

Palavras-chave principais: **tarot online**, **tarot grátis / tarot de graça**,
**jogar tarot online**, **tarô**, **tiragem de tarot** (e em inglês: *free
online tarot*, *play tarot online*, *tarot reading*).

- Onde estão: `seo.*` (títulos e descrições), `hero.*` (H1 e lede da landing)
  e `faq.*` nos arquivos de tradução. A FAQ da landing responde buscas de
  cauda longa ("tarot online é grátis?", "precisa de cadastro?") e vira
  JSON-LD `FAQPage` (`src/seo/structuredData.ts`). O texto das respostas
  precisa continuar verdadeiro em relação aos planos (`src/data/plans.ts`).
- `plugins/seo.ts` gera no build um `dist/<idioma>/<rota>/index.html` por
  página indexável, já com título, descrição, `lang`, canonical, hreflang,
  Open Graph e JSON-LD corretos. Assim, crawlers e previews de link que não
  executam JavaScript veem o `<head>` certo de cada página (o corpo ainda é
  renderizado no cliente).

## Páginas de cartas e Sobre

- `/:lang/cartas` (índice das 78 cartas em cinco "jornadas") e
  `/:lang/cartas/:slug` (uma página por carta: significado normal e
  invertido, no amor, no trabalho, conselho e como ler), mais `/:lang/sobre`.
  São 83 páginas indexáveis por idioma, 166 URLs no sitemap.
- Slugs vêm do nome em pt (`src/data/cardSlugs.ts`) e são os mesmos nos dois
  idiomas, como as outras rotas (`/en/cartas/a-torre`).
- O conteúdo das cartas fica em `src/content/cards/pt.json` e `en.json`
  (mesmas chaves), carregado só nas páginas de cartas. Palavras-chave e
  significados vêm de `tarot_base_conhecimento_rag.md`; "no amor", "no
  trabalho" e "conselho" foram escritos para o site e valem uma revisão.
- Cada página de carta sai no sitemap com a imagem da carta
  (`<image:image>`), e o `<head>` pré-renderizado leva `og:image`, JSON-LD
  `Article` + `BreadcrumbList`. O índice usa `CollectionPage` + `ItemList`; a
  Sobre, `AboutPage` com a Artemis Digital Tech como publisher.
