#!/usr/bin/env bash
#
# control.sh - manage the docker compose stack defined in ./docker-compose-app.yml
#
# Usage:
#   control.sh start [--build]       Start the stack (won't pull if an image is already present)
#   control.sh pullstart [--build]   Force pull image(s), then start the stack
#   control.sh restart               Force recreate all containers and rebuild images
#   control.sh stop                  Stop and remove the stack
#   control.sh status                Show the status of the stack
#
# --build rebuilds images for services that have a "build:" section
# (using the local Dockerfile). It has no effect on image-only services.

set -euo pipefail

COMPOSE_FILE="./docker-compose-app.yml"
# Env file used for ${VAR} substitution in the compose file (same directory).
# Override with: ENV_FILE=./other.env ./control.sh start
ENV_FILE="${ENV_FILE:-./.env}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") {start|pullstart|restart|stop|status} [--build]

  start [--build]      Start container(s); won't pull if an image is already present
  pullstart [--build]  Force pull the latest image(s) and start container(s)
  restart              Force recreate all containers and rebuild images
  stop                 Stop and remove container(s)
  status               Show container status

  --build              Also rebuild images that have a "build:" section
                       (only valid with start and pullstart)
USAGE
  exit 1
}

# Pick "docker compose" (v2 plugin) or fall back to "docker-compose" (v1)
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Error: neither 'docker compose' nor 'docker-compose' was found." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: $COMPOSE_FILE not found in $(pwd)" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found in $(pwd)" >&2
  exit 1
fi

if [[ ! -r "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE is not readable by $(id -un)" >&2
  exit 1
fi

dc() {
  "${COMPOSE[@]}" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

[[ $# -ge 1 && $# -le 2 ]] || usage

CMD="$1"
BUILD=false

if [[ $# -eq 2 ]]; then
  if [[ "$2" == "--build" && ("$CMD" == "start" || "$CMD" == "pullstart") ]]; then
    BUILD=true
  else
    usage
  fi
fi

case "$CMD" in
start)
  # Uses images already on disk; only pulls if an image is missing
  if $BUILD; then
    dc up -d --build
  else
    dc up -d
  fi
  ;;
pullstart)
  # Pull the latest version of image-based services
  dc pull
  if $BUILD; then
    # Also refresh base images and rebuild services with a build: section
    dc build --pull
    dc up -d --build
  else
    dc up -d
  fi
  ;;
restart)
  # Recreate every container and rebuild images from local Dockerfiles
  dc up -d --force-recreate --build
  ;;
stop)
  dc down
  ;;
status)
  dc ps
  ;;
*)
  usage
  ;;
esac
