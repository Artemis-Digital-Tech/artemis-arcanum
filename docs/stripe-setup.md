# Configurando o Stripe para os planos do Arcanum

Este guia configura a cobrança real dos dois planos pagos (**Arcanum Plus** e
**Arcanum Ritual**) definidos em [`src/data/plans.ts`](../src/data/plans.ts).
O plano **Grátis** não precisa de nada no Stripe — ele é o estado padrão de
quem nunca assinou.

## O que já está implementado

Todo o código já está pronto e publicado; falta só a configuração do lado do
Stripe (contas, produtos, chaves). O fluxo funciona assim:

1. O visitante clica em "Assinar o Plus" ou "Assinar o Ritual" em `/precos`.
2. Se não estiver logado, é mandado para `/entrar` primeiro (a assinatura
   precisa de uma identidade para saber de quem é).
3. Logado, o front-end chama a função `stripe-checkout` (Supabase Edge
   Function), que cria uma **Checkout Session** do Stripe e devolve a URL.
4. O navegador é redirecionado para o checkout hospedado pelo Stripe —
   nenhum dado de cartão passa pelo nosso servidor.
5. Ao concluir o pagamento, o Stripe chama a função `stripe-webhook`, que
   grava o plano do usuário na tabela `subscriptions` do Supabase.
6. O front-end consulta a função `plan` (autenticado) para saber o plano real
   do usuário — é isso que `src/hooks/usePlan.ts` usa para quem está logado.

Projeto Supabase usado: **arcanum** (`igjpkdawtxtmbvqfktgj`), mesmo projeto
já configurado para o login e o histórico de leituras.

```
src/Pricing.tsx  ──chama──▶  Edge Function "stripe-checkout"  ──cria──▶  Stripe Checkout Session
                                                                              │
                                                                    visitante paga lá
                                                                              │
Stripe  ──dispara webhook──▶  Edge Function "stripe-webhook"  ──grava──▶  tabela "subscriptions"
                                                                              ▲
src/hooks/usePlan.ts  ──consulta──▶  Edge Function "plan"  ─────────────────┘
```

### Onde cada coisa é configurada

Os dois painéis usam a palavra "webhook", e é fácil configurar no lugar
errado. A divisão é esta:

| O que | Onde | Passo |
|---|---|---|
| Produtos e preços (4 price IDs) | Dashboard da **Stripe** | 2 |
| Secret key (`sk_...`) | Dashboard da **Stripe** | 3 |
| Endpoint do webhook + signing secret (`whsec_...`) | Dashboard da **Stripe** | 5 |
| Todos os secrets (`STRIPE_*`) | **Supabase** → Project Settings → Edge Functions → Secrets | 4 e 5 |
| Tabela `subscriptions` e as Edge Functions | já criadas, nada a fazer | — |

A tela **Database Webhooks** do Supabase (aquela com "Table", "Insert /
Update / Delete", "HTTP Headers") **não é usada em momento nenhum** neste
guia. Ela serve para outra coisa: ver o passo 5.

## 1. Criar (ou acessar) sua conta Stripe

Se ainda não tiver uma: [dashboard.stripe.com/register](https://dashboard.stripe.com/register).

Comece em **modo de teste** (o botão "Test mode" no canto superior direito do
dashboard deve estar ativado). Todo este guia usa o modo de teste primeiro;
a seção final explica como repetir em modo real (live) quando for lançar.

## 2. Criar os produtos e preços

No dashboard: **Product catalog → Add product**. Crie **dois produtos**, cada
um com **dois preços recorrentes** (mensal e anual):

### Produto 1 — Arcanum Plus

- **Name**: `Arcanum Plus`
- Preço 1: **Recurring**, `BRL`, `19.90`, cobrança **Monthly**
- Depois de salvar, clique em **Add another price** no mesmo produto:
  Preço 2: **Recurring**, `BRL`, `159.90`, cobrança **Yearly**

### Produto 2 — Arcanum Ritual

- **Name**: `Arcanum Ritual`
- Preço 1: **Recurring**, `BRL`, `34.90`, cobrança **Monthly**
- Preço 2 (mesmo produto): **Recurring**, `BRL`, `279.90`, cobrança **Yearly**

> Os valores acima são os mesmos já cadastrados em `src/data/plans.ts` — se
> mudar o preço em um lugar, mude no outro também, os dois não se sincronizam
> sozinhos.

Para cada um dos **quatro preços**, abra a página do preço e copie o **Price
ID** (começa com `price_...`). Você vai usar os quatro em breve:

| Plano  | Ciclo   | Price ID (anote aqui) |
|--------|---------|------------------------|
| Plus   | Mensal  | `price_...` |
| Plus   | Anual   | `price_...` |
| Ritual | Mensal  | `price_...` |
| Ritual | Anual   | `price_...` |

## 3. Pegar a chave secreta

**Developers → API keys** ([dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)
no modo de teste) → linha **Secret key** → clique em **Reveal test key** e
copie o valor revelado.

> ⚠️ **Copie a chave, não o ID da chave.** O dashboard novo da Stripe mostra,
> ao lado de cada chave, um identificador que começa com `mk_...`. Esse é o
> ID do objeto da chave, e **não funciona como credencial**: a API responde
> `Invalid API key provided: mk_... This looks like the ID of an API key
> rather than the key itself`.
>
> O valor certo é o que aparece **depois de clicar em "Reveal"**, e começa
> com um destes prefixos:
>
> | Prefixo | O que é | Serve aqui? |
> |---|---|---|
> | `sk_test_` / `sk_live_` | Secret key | ✅ sim |
> | `rk_test_` / `rk_live_` | Restricted key | ✅ sim, se tiver permissão de escrita em Checkout Sessions, Prices e Subscriptions |
> | `pk_test_` / `pk_live_` | Publishable key (vai no navegador) | ❌ não |
> | `mk_...` | ID do objeto da chave | ❌ não |
>
> Em **modo live**, a secret key só é exibida uma vez, no momento em que é
> criada. Se você não guardou, não tem como revelar de novo: crie uma nova
> chave (ou faça *roll*) e use a nova.

Essa chave nunca vai para o navegador, só para os secrets das Edge Functions,
no próximo passo.

## 4. Configurar os secrets das Edge Functions

As três funções (`stripe-checkout`, `stripe-webhook`, `plan`) já estão
publicadas no projeto Supabase, mas dependem de variáveis de ambiente que
precisam ser cadastradas manualmente — não são segredo do código, então não
fazem parte do deploy.

### Opção A — pelo Supabase CLI (recomendado)

```bash
npm install -g supabase
supabase login
supabase link --project-ref igjpkdawtxtmbvqfktgj
```

```bash
supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx \
  STRIPE_PRICE_PLUS_MONTHLY=price_xxxxxxxxxxxx \
  STRIPE_PRICE_PLUS_ANNUAL=price_xxxxxxxxxxxx \
  STRIPE_PRICE_RITUAL_MONTHLY=price_xxxxxxxxxxxx \
  STRIPE_PRICE_RITUAL_ANNUAL=price_xxxxxxxxxxxx
```

(`STRIPE_WEBHOOK_SECRET` vem no próximo passo, depois de criar o webhook.)

### Opção B — pelo Dashboard do Supabase

[supabase.com/dashboard/project/igjpkdawtxtmbvqfktgj/settings/functions](https://supabase.com/dashboard/project/igjpkdawtxtmbvqfktgj/settings/functions) →
seção **Secrets** → adicione cada variável acima, uma por uma.

## 5. Criar o webhook no Stripe

> ⚠️ **Não é no Supabase.** O Supabase tem uma tela chamada **Database
> Webhooks** (Database → Webhooks), com campos como "Table", "Events:
> Insert/Update/Delete", "Type of webhook", "HTTP Headers". **Ignore essa
> tela por completo neste guia.** Ela serve para o Postgres disparar uma
> requisição HTTP *para fora* quando uma linha muda numa tabela. O que
> precisamos aqui é o contrário: a **Stripe** mandando uma requisição *para
> dentro*, para a nossa Edge Function, quando alguém paga. Isso se
> configura no dashboard da Stripe, e em nenhum outro lugar.
>
> A Edge Function `stripe-webhook` já está publicada e é acessível pela
> internet: não é preciso criar, expor nem rotear nada do lado do Supabase.
> A única coisa que falta lá é o secret, no final deste passo.

No dashboard da **Stripe**: **Developers → Webhooks → Add endpoint** (em
contas mais novas o caminho aparece como **Developers → Event destinations
→ Add destination**, com os mesmos campos).

Preencha:

- **Endpoint URL** (ou "Destination URL"):
  ```
  https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/stripe-webhook
  ```
- **Listen to**: `Events on your account` (não "Events on connected
  accounts").
- **Select events** / **Events to send**: marque exatamente estes três e
  nada mais:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Version**: pode deixar a versão padrão da sua conta.

Clique em **Add endpoint** para salvar.

Depois de criar, abra o endpoint que acabou de aparecer na lista e clique em
**Reveal** no campo **Signing secret**. É uma string que começa com
`whsec_...`, e ela é diferente da sua secret key (`sk_...`) do passo 3.
Cadastre-a como mais um secret **no Supabase**:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

(ou pelo Dashboard do Supabase, mesma tela do passo 4: Project Settings →
Edge Functions → Secrets. De novo: **não** é a tela de Database Webhooks.)

## 6. Testar

Com tudo configurado, rode o app (`npm run dev`), entre com sua conta em
`/entrar`, vá em `/precos` e clique em "Assinar o Plus" ou "Assinar o
Ritual". Você cai no checkout de verdade do Stripe (em modo de teste). Use um
cartão de teste:

- Número: `4242 4242 4242 4242`
- Validade: qualquer data futura
- CVC: qualquer 3 dígitos

Depois de "pagar", o Stripe redireciona de volta para `/precos?checkout=success`
e o plano deve atualizar em alguns segundos (a página busca o plano de novo
ao voltar o foco na aba). Para conferir que o webhook realmente chegou:
**Developers → Webhooks → (seu endpoint) → aba Events** no dashboard do
Stripe — deve aparecer `checkout.session.completed` com status `200`.

Se algo falhar, os logs da função dão o motivo:

```bash
supabase functions logs stripe-webhook --project-ref igjpkdawtxtmbvqfktgj
```

### Diagnóstico rápido da configuração

A função `stripe-checkout` responde a um `GET` (autenticado) que testa cada
price ID contra a Stripe e reporta o modo da chave. É o jeito mais rápido de
descobrir o que está errado sem precisar tentar um checkout:

```bash
curl -s --url 'https://igjpkdawtxtmbvqfktgj.supabase.co/functions/v1/stripe-checkout' \
  -H 'authorization: Bearer <ID_TOKEN_DO_AUTH0>' | jq
```

O ID token sai do navegador com a sessão logada (DevTools → Network → qualquer
chamada para `/functions/v1/plan` → header `authorization`).

Resposta saudável:

```json
{
  "keyMode": "test",
  "prices": {
    "plus_monthly": { "ok": true, "livemode": false, "currency": "brl", "recurring": "month", "unit_amount": 1990 }
  }
}
```

| Sintoma na resposta | Causa |
|---|---|
| `keyMode: "unrecognized_prefix"` | A chave não é `sk_`/`rk_`. Quase sempre é o ID `mk_...` ou a publishable `pk_...`. Veja o passo 3. |
| `keyMode: "missing"` | O secret `STRIPE_SECRET_KEY` não foi cadastrado. |
| `keyMode: "test"` com `livemode: true` (ou o inverso) | Chave e preços em modos diferentes. Test e live são contas separadas: os price IDs de um não existem no outro. |
| `code: "resource_missing"` | O price ID não existe nessa conta/modo. Típico de copiar o **Product ID** (`prod_...`) no lugar do **Price ID** (`price_...`). |
| `recurring: null` | O preço foi criado como **One time**. `mode: subscription` rejeita. Crie o preço como **Recurring**. |
| `active: false` | Preço arquivado na Stripe. |
| `configured: false` | Falta cadastrar aquele secret `STRIPE_PRICE_*`. |

> **Secrets e cold start:** as funções leem os secrets quando a instância
> sobe. Depois de rodar `supabase secrets set`, uma instância que já estava
> quente pode continuar com o valor antigo por alguns instantes. Se o erro
> persistir com o valor certo cadastrado, force um redeploy da função para
> derrubar as instâncias antigas.

## 7. Indo para produção (modo live)

O Stripe trata teste e produção como duas contas completamente separadas —
produtos, preços e chaves de teste **não existem** no modo live. Quando for
lançar de verdade:

1. Desative o "Test mode" no dashboard do Stripe.
2. Repita o passo 2 (criar os dois produtos e quatro preços) — agora em modo
   live.
3. Repita o passo 3 para pegar a **live secret key** (`sk_live_...`).
4. Repita o passo 5 para criar o webhook em modo live (a URL do endpoint é a
   mesma) e pegar o novo `whsec_...` de produção.
5. Atualize os secrets do Supabase com os valores `sk_live_...`, os quatro
   `price_...` novos, e o `whsec_...` novo — mesmo comando do passo 4, só
   trocando os valores.

Não existe "ambiente" separado nas Edge Functions neste projeto — os secrets
valem para todo mundo que chamar a função. Troque de teste para live só
quando estiver pronto para cobrar de verdade.

## Referência rápida dos secrets

| Nome | De onde vem |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → (seu endpoint) |
| `STRIPE_PRICE_PLUS_MONTHLY` | Price ID do preço mensal do Arcanum Plus |
| `STRIPE_PRICE_PLUS_ANNUAL` | Price ID do preço anual do Arcanum Plus |
| `STRIPE_PRICE_RITUAL_MONTHLY` | Price ID do preço mensal do Arcanum Ritual |
| `STRIPE_PRICE_RITUAL_ANNUAL` | Price ID do preço anual do Arcanum Ritual |
