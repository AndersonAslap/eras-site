# Eras — site

Landing page e páginas institucionais do **Eras — "Como eu seria?"**, em HTML, CSS e JavaScript puros, sem
framework e **sem etapa de build**: abre direto no navegador e pode ir para qualquer hospedagem estática.

## Abrir localmente

- Direto no navegador: abra `site/index.html`. Tudo funciona; o Chrome só registra no console avisos de CORS
  do `preload` das fontes (limitação de arquivos locais) — com um servidor esses avisos não aparecem.
- Com um servidor (recomendado, para a 404 e caminhos absolutos):
  `cd site && python3 -m http.server 4173` e abra http://localhost:4173

## Páginas

| Página | pt-BR | en | es |
|---|---|---|---|
| Início (landing) | `index.html` | `locales/en/index.html` | `locales/es/index.html` |
| Exemplos | `exemplos.html` | `locales/en/exemplos.html` | `locales/es/exemplos.html` |
| Sobre | `sobre.html` | `locales/en/sobre.html` | `locales/es/sobre.html` |
| Privacidade do app (`/privacy`) | `privacy.html` | `locales/en/privacy.html` | `locales/es/privacy.html` |
| Termos | `termos.html` | `locales/en/termos.html` | `locales/es/termos.html` |
| 404 | `404.html` (única, usada pelo GitHub Pages e pela Vercel para qualquer URL inexistente) | | |

`privacidade.html` (nos 3 idiomas) é só um redirecionamento para `privacy.html` — o app e links antigos usam esse endereço.

## Editar conteúdo

O HTML é **gerado** e commitado ([ADR 0014](../docs/adr/0014-estrutura-do-site-e-gerador-de-paginas.md)):

1. Edite os textos em `scripts/content/pt-BR.mjs`, `en-US.mjs`, `es-ES.mjs` (ilustrações em `scenes.mjs`;
   layout das páginas e configuração — domínio, links do app, Plausible, contatos — em `scripts/build-pages.mjs`).
2. Rode `npm run pages` (ou `node scripts/build-pages.mjs`) dentro de `site/`.
3. Estilos: `assets/css/tokens.css` (todas as cores, fontes, espaços, raios e sombras — a paleta do app,
   `app/src/core/theme/palette.ts`) → `base.css` → `components.css` → `pages.css`. Não use valores soltos fora de `tokens.css`.
4. Outro domínio ou subpasta: `SITE_URL=https://usuario.github.io/eras npm run pages` (o workflow do GitHub Pages faz isso sozinho).

**Cache:** CSS e JS são servidos com cache de 1 ano e `?v=<versão>`. Ao mudar CSS/JS, aumente
`assetVersion` em `scripts/build-pages.mjs` e rode `npm run pages`.

**Analytics:** defina `plausibleDomain` em `scripts/build-pages.mjs` para ligar o Plausible (sem cookies).
Eventos: clique em "Criar minha história", troca de idioma e abertura de exemplo.

**Links do app:** os botões levam a `https://app.eras.app/login` e `/signup` `[A CONFIRMAR domínio]`; em
desenvolvimento, troque por `http://localhost:5173/login` e `/signup` na configuração do gerador. Parâmetros
`utm_*` da URL do site são repassados para o cadastro.

## Verificações

- `npm run check` — páginas obrigatórias e links internos quebrados.
- Lighthouse mobile (2026-10-19, versão anterior ao visual do app — refazer após o redesign; Desempenho / Acessibilidade / Boas práticas / SEO): início 97 / 98 / 100 / 100 e
  exemplos 98 / 100 / 100 / 100. O único aviso de acessibilidade (ordem dos títulos no hero) foi corrigido depois.

## Deploy

> Este site pode ser publicado em qualquer cloud ou hospedagem estática. O repositório já vem pronto para o
> **GitHub Pages** (workflow `.github/workflows/deploy-site.yml`, guia em
> [docs/17-PUBLICAR-SITE-NO-GITHUB-PAGES.md](../docs/17-PUBLICAR-SITE-NO-GITHUB-PAGES.md)) e para a **Vercel**, descrita abaixo.

**Como funciona na Vercel:** site estático, sem build — a pasta `site/` é publicada como está
([ADR 0016](../docs/adr/0016-deploy-do-site-na-vercel.md)).
- `cleanUrls` ligado: `/exemplos` serve `exemplos.html` (os links `.html` internos redirecionam para a URL
  limpa); `trailingSlash` desligado. Canonical, `hreflang` e `sitemap.xml` usam as URLs limpas.
- `404.html` é usada automaticamente como página de erro.
- Cache: `assets/css|js|fonts` 1 ano (imutável, com `?v=`), `assets/img` 1 semana, HTML sempre revalidado.
- Headers de segurança no `vercel.json`: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`.
- O domínio (`https://eras.app` `[A CONFIRMAR]`) é o mesmo da URL canônica, do Open Graph e do `sitemap.xml`
  (constante `domain` no gerador).

### Pré-requisitos

Conta na Vercel, Node/npm, Vercel CLI (ou `npx`; o script fixa `vercel@62.2.0`) e o domínio do site
(opcional no primeiro deploy).

### Primeiro deploy (passo a passo)

1. `vercel login` (ou exporte `VERCEL_TOKEN`).
2. `npm run deploy:vercel` (dentro de `site/`) — na primeira vez a CLI pergunta o time e o nome do projeto e
   cria o vínculo (`.vercel/`, fora do git). As verificações rodam antes; se houver link quebrado, nada é publicado.
3. O site não usa variáveis de ambiente; se um dia usar, cadastre com `vercel env add <NOME> production`.
4. Configure o domínio em *Settings → Domains* e confira se é o mesmo do `sitemap.xml` e das tags canônicas.
5. `npm run deploy:vercel:prod` para publicar em produção.

### Deploys seguintes

`npm run deploy:vercel` (preview para testar) e `npm run deploy:vercel:prod` (produção).

### Domínio próprio

Em *Settings → Domains*, adicione `eras.app` (e `www.eras.app` redirecionando para ele) e crie os registros
DNS indicados pela Vercel. Se o domínio mudar, atualize `domain` em `scripts/build-pages.mjs` e rode `npm run pages`.

### Rollback

`vercel rollback` ou, no painel, *Deployments → ⋯ → Promote to Production* em um deploy anterior.

### Deploy automático (opcional)

Conecte o repositório GitHub ao projeto da Vercel com **Root Directory = `site`**; cada push gera um preview
e a branch principal publica em produção.

### Publicar em outra cloud

Envie o conteúdo de `site/` (sem `scripts/`, `README.md` e `package.json`) para a hospedagem. Se ela não
suportar URLs limpas, nada muda: os links internos já usam `.html`. Configure a `404.html` como página de erro.
