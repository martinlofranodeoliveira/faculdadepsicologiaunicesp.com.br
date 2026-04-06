#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   chmod +x scripts/vm_sync_build_homolog.sh
#   ./scripts/vm_sync_build_homolog.sh
#
# Optional overrides:
#   REPO_URL=https://github.com/martinlofranodeoliveira/faculdadepsicologiaunicesp.com.br.git
#   TARGET_DIR=/www/wwwroot/faculdadepsicologiaunicesp.com.br
#   BRANCH=main
#   SERVICE_NAME=faculdadepsicologiaunicesp
#   RESTART_SERVICE=1

REPO_URL="${REPO_URL:-https://github.com/martinlofranodeoliveira/faculdadepsicologiaunicesp.com.br.git}"
TARGET_DIR="${TARGET_DIR:-/www/wwwroot/faculdadepsicologiaunicesp.com.br}"
BRANCH="${BRANCH:-main}"
SERVICE_NAME="${SERVICE_NAME:-faculdadepsicologiaunicesp}"
RESTART_SERVICE="${RESTART_SERVICE:-1}"

echo "==> Repo:   $REPO_URL"
echo "==> Pasta:  $TARGET_DIR"
echo "==> Branch: $BRANCH"

if [ -d "$TARGET_DIR/.git" ]; then
  echo "==> Atualizando repositorio existente..."
  git -C "$TARGET_DIR" remote set-url origin "$REPO_URL"
  git -C "$TARGET_DIR" fetch --all --prune
  git -C "$TARGET_DIR" checkout "$BRANCH"
  git -C "$TARGET_DIR" pull --ff-only origin "$BRANCH"
else
  echo "==> Clonando repositorio..."
  mkdir -p "$(dirname "$TARGET_DIR")"
  git clone --branch "$BRANCH" "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"

echo "==> Instalando dependencias..."
npm ci

echo "==> Build de producao..."
npm run build

echo "==> OK: build gerada em $TARGET_DIR/dist"

if [ "$RESTART_SERVICE" = "1" ]; then
  if command -v systemctl >/dev/null 2>&1; then
    if systemctl cat "$SERVICE_NAME" >/dev/null 2>&1; then
      echo "==> Recarregando configuracao do systemd..."
      systemctl daemon-reload
      echo "==> Reiniciando service $SERVICE_NAME..."
      systemctl restart "$SERVICE_NAME"
      echo "==> Status do service $SERVICE_NAME:"
      systemctl status "$SERVICE_NAME" --no-pager || true
    else
      echo "==> Aviso: service $SERVICE_NAME nao encontrado. Pulando restart."
    fi
  else
    echo "==> Aviso: systemctl indisponivel. Pulando restart do service."
  fi
fi
