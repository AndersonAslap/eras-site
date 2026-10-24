#!/usr/bin/env bash
# Deploy do site do Eras na Vercel (preview por padrão; --prod para produção).
# O site é estático e sem build: a pasta site/ é publicada como está.
set -euo pipefail

VERCEL_VERSION="62.2.0"
STEP="início"
trap 'echo "✖ Falhou na etapa: ${STEP}" >&2' ERR

usage() {
  cat <<HELP
Uso: ./scripts/deploy-vercel.sh [--prod] [--check] [--help]

  (sem flags)  deploy de PREVIEW
  --prod       deploy de PRODUÇÃO
  --check      só roda as verificações (arquivos obrigatórios e links quebrados), sem publicar
  --help       mostra esta ajuda

Autenticação: exporte VERCEL_TOKEN (CI) ou rode "vercel login".
HELP
}

PROD=false
CHECK_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --prod) PROD=true ;;
    --check) CHECK_ONLY=true ;;
    --help | -h) usage; exit 0 ;;
    *) echo "Parâmetro desconhecido: $arg" >&2; usage; exit 1 ;;
  esac
done

cd "$(dirname "$0")/.."

# 1. Verificações rápidas: páginas obrigatórias e links internos quebrados.
STEP="verificação de arquivos"
for required in index.html 404.html sitemap.xml robots.txt; do
  [[ -f "$required" ]] || { echo "Arquivo obrigatório ausente: $required" >&2; exit 1; }
done

STEP="verificação de links"
node --input-type=module - <<'NODE'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (['scripts', 'node_modules', '.vercel'].includes(name)) return [];
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
  });

const broken = [];
for (const file of walk('.')) {
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|eras:|#)/.test(url)) continue;
    const clean = url.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? normalize(join('.', clean)) : normalize(join(dirname(file), clean));
    const candidates = [target, `${target}.html`, join(target, 'index.html')];
    if (!candidates.some((path) => existsSync(path) && statSync(path).isFile())) broken.push(`${file} → ${url}`);
  }
}
if (broken.length) {
  console.error(`Links quebrados (${broken.length}):\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ Nenhum link interno quebrado');
NODE

if $CHECK_ONLY; then
  echo "✓ Verificações concluídas (nada foi publicado)"
  exit 0
fi

# 2. Pré-requisitos: Node/npm e Vercel CLI (global ou via npx com versão fixada) e autenticação.
STEP="pré-requisitos"
command -v node >/dev/null || { echo "Node.js não encontrado." >&2; exit 1; }
if command -v vercel >/dev/null; then VERCEL=(vercel); else VERCEL=(npx --yes "vercel@${VERCEL_VERSION}"); fi
TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
elif ! "${VERCEL[@]}" whoami >/dev/null 2>&1; then
  echo "Sem autenticação na Vercel. Rode 'vercel login' ou exporte VERCEL_TOKEN." >&2
  exit 1
fi

ENVIRONMENT=preview
PROD_ARGS=()
if $PROD; then ENVIRONMENT=production; PROD_ARGS=(--prod); fi

# 3. Vínculo com o projeto da Vercel (cria .vercel/, ignorado pelo git).
STEP="vercel link"
if [[ ! -f .vercel/project.json ]]; then "${VERCEL[@]}" link --yes "${TOKEN_ARGS[@]}"; fi

# 4. Configurações e variáveis do ambiente escolhido.
STEP="vercel pull ($ENVIRONMENT)"
"${VERCEL[@]}" pull --yes --environment="$ENVIRONMENT" "${TOKEN_ARGS[@]}"

# 5. Build no formato da Vercel (cópia dos arquivos estáticos) e deploy do resultado.
STEP="vercel build"
"${VERCEL[@]}" build "${PROD_ARGS[@]}" "${TOKEN_ARGS[@]}"
STEP="vercel deploy"
URL=$("${VERCEL[@]}" deploy --prebuilt "${PROD_ARGS[@]}" "${TOKEN_ARGS[@]}")

# 6. Resultado.
echo "✔ Deploy ($ENVIRONMENT) publicado: $URL"
