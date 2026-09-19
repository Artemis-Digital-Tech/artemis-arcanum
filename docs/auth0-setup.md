# Configurando o Auth0 para o Arcanum

O login já está implementado no código (tela `/entrar`, botão "Entrar" no
cabeçalho, `Auth0ProviderWithNavigate`). Falta só criar a aplicação no Auth0
e colocar as duas credenciais num arquivo `.env.local`. Sem isso, o app
funciona normalmente — o controle de conta simplesmente não aparece.

## 1. Criar a conta e o tenant (se ainda não tiver)

1. Acesse [auth0.com](https://auth0.com) e crie uma conta (tem plano free).
2. No primeiro acesso, o Auth0 pede para criar um **tenant** (o nome da sua
   instância, ex.: `arcanum-dev`) e uma região. Escolha a região mais
   próxima dos seus usuários (ex.: US ou Brasil/South America, se
   disponível no seu plano).

## 2. Criar a aplicação (Application)

1. No painel do Auth0, vá em **Applications → Applications**.
2. Clique em **Create Application**.
3. Dê um nome (ex.: `Arcanum Web`).
4. Escolha o tipo **Single Page Application** — é o tipo certo para um app
   React que roda no navegador (não use "Regular Web Application" nem
   "Machine to Machine").
5. Clique em **Create**.

## 3. Configurar as URLs permitidas

Ainda na aplicação criada, vá na aba **Settings** e preencha estes três
campos. Para desenvolvimento local (Vite na porta padrão), use:

- **Allowed Callback URLs**: `http://localhost:5173/callback`
- **Allowed Logout URLs**: `http://localhost:5173`
- **Allowed Web Origins**: `http://localhost:5173`

Quando for para produção, adicione a URL real do site nos três campos,
**separada por vírgula** junto com a de localhost (não precisa remover a de
localhost, só adicionar a nova):

```
Allowed Callback URLs: http://localhost:5173/callback, https://arcanum.seudominio.com/callback
Allowed Logout URLs:   http://localhost:5173, https://arcanum.seudominio.com
Allowed Web Origins:   http://localhost:5173, https://arcanum.seudominio.com
```

Role até o fim da página e clique em **Save Changes**.

> Por que `/callback` no primeiro campo, mas só a origem nos outros dois? O
> front-end manda `redirect_uri` como `window.location.origin + "/callback"`
> — é uma rota dedicada (`src/auth/Callback.tsx`) que existe só para receber
> a volta do Auth0. Isso é necessário porque a rota `/` do app redireciona
> sozinha para `/pt`, o que apagaria os parâmetros `code`/`state` da URL
> antes do SDK conseguir lê-los se o callback caísse ali. O Auth0 só aceita
> voltar para uma URL que esteja na lista de Callback URLs, por segurança.

### Login social (Google, GitHub) e a tela de consentimento

A tela de login já vem com botões próprios "Continuar com Google" e
"Continuar com GitHub" (não é a página hospedada do Auth0) — eles chamam
`loginWithRedirect` com a conexão social já escolhida, então o usuário vai
direto para a tela do provedor.

Para isso funcionar:

1. Em **Authentication → Social**, habilite as conexões **Google /
   Gmail** e **GitHub** (o Auth0 já vem com credenciais de desenvolvimento
   prontas, suficientes para testar) e, na aba **Applications** de cada
   conexão, marque a aplicação `Arcanum Web` como habilitada.
2. Se aparecer uma tela **"Authorize App"** pedindo consentimento depois do
   login (em vez de voltar direto autenticado), vá em **Applications →
   Arcanum Web → Settings → Advanced Settings → Application Metadata** (ou,
   em tenants mais novos, o próprio topo da aba Settings) e confirme que a
   aplicação está marcada como **First Party**. Aplicações First Party não
   pedem consentimento explícito ao usuário.

## 4. Pegar o Domain e o Client ID

No topo da mesma aba **Settings**, você vê:

- **Domain** — algo como `arcanum-dev.us.auth0.com`
- **Client ID** — uma string alfanumérica longa

Copie os dois.

## 5. Preencher o `.env.local` do projeto

Na raiz do projeto (`artemis-arcanum/`), copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Abra `.env.local` e substitua pelos valores reais:

```
VITE_AUTH0_DOMAIN=arcanum-dev.us.auth0.com
VITE_AUTH0_CLIENT_ID=cole_o_client_id_aqui
```

`.env.local` já está no `.gitignore` — essas credenciais nunca vão para o
Git.

## 6. Reiniciar o servidor de desenvolvimento

Variáveis de ambiente só são lidas quando o Vite inicia. Se o servidor já
estava rodando, pare (`Ctrl+C`) e rode de novo:

```bash
npm run dev
```

## 7. Testar

1. Abra o site — o link **"Entrar"** deve aparecer no cabeçalho agora
   (antes, sem as credenciais, ele fica invisível).
2. Clique em "Entrar" → você vai para `/entrar` → clique no botão principal
   → você é redirecionado para a tela de login hospedada pelo próprio
   Auth0 (Universal Login).
3. Crie uma conta de teste ali (ou use "Continue with Google" se você
   ativar esse conector — passo opcional, ver seção 8) e complete o login.
4. Você deve voltar para a página exata de onde clicou em "Entrar", agora
   com seu nome/e-mail e um link "Sair" no lugar do "Entrar".

Se aparecer uma tela de erro do Auth0 dizendo que o callback não é
permitido, volte no passo 3 e confirme que a URL bate **exatamente** (sem
barra final, sem `https` onde deveria ser `http` em localhost).

## 8. (Opcional) Login social — Google, etc.

Por padrão o Auth0 já vem com login por e-mail/senha. Para adicionar Google
ou outro provedor:

1. **Authentication → Social** no menu lateral.
2. Escolha o provedor (ex.: Google) e siga o assistente — ele pede as
   credenciais OAuth do provedor (no caso do Google, um Client ID/Secret do
   Google Cloud Console).
3. Na aba **Applications** desse conector, marque a aplicação `Arcanum Web`
   para habilitá-lo nela.

Nenhuma mudança de código é necessária no front-end para isso — a tela de
Universal Login do Auth0 já mostra os botões sociais habilitados
automaticamente.

## 9. Indo para produção

Quando o domínio real do site estiver pronto:

1. Volte em **Applications → Arcanum Web → Settings**.
2. Adicione a URL de produção nos três campos do passo 3 (mantendo a de
   localhost, útil para continuar testando localmente).
3. No servidor/plataforma onde o site é publicado (Vercel, Netlify, etc.),
   configure as mesmas duas variáveis de ambiente
   (`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`) nas configurações de
   ambiente de produção daquela plataforma — `.env.local` não é enviado no
   deploy, cada plataforma tem seu próprio painel de variáveis de ambiente.

## O que já está pronto no código (não precisa tocar)

- `src/auth/auth0Config.ts` — lê as duas variáveis e expõe
  `isAuth0Configured`.
- `src/auth/Auth0ProviderWithNavigate.tsx` — envolve o app no
  `Auth0Provider`; se as variáveis não estiverem definidas, deixa o app
  funcionar normalmente sem login.
- `src/components/AccountMenu.tsx` — o link "Entrar"/estado logado no
  cabeçalho (aparece em todas as telas).
- `src/Login.tsx` — a tela `/entrar`, com os estados de carregando, erro
  (com "Tentar de novo"), já logado, e não configurado.
- O login é **opcional**: nenhuma tela do fluxo de leitura exige conta. Se
  no futuro vocês decidirem exigir login antes de gerar uma leitura, isso é
  uma mudança de comportamento separada (e vai exigir também ajustar a copy
  da landing page, que hoje promete "sem cadastro").
