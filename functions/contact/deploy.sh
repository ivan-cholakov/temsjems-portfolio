#!/usr/bin/env bash
set -euo pipefail

env_file=${1:?usage: functions/contact/deploy.sh <scaleway-env-file>}
here=$(cd "$(dirname "$0")" && pwd)

namespace_name=moiraemoss
function_name=contact
runtime=node24

for tool in scw jq zip; do
  command -v "$tool" >/dev/null || { echo "deploy.sh: $tool is not on PATH" >&2; exit 1; }
done

set -a
. "$env_file"
set +a

for var in SCW_DEFAULT_PROJECT_ID SCW_DEPLOY_ACCESS_KEY SCW_DEPLOY_SECRET_KEY SCW_TEM_SECRET_KEY; do
  [ -n "${!var:-}" ] || { echo "deploy.sh: $var is not set in $env_file" >&2; exit 1; }
done

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

export SCW_CONFIG_PATH=$workdir/no-config.yaml
export SCW_ACCESS_KEY=$SCW_DEPLOY_ACCESS_KEY
export SCW_SECRET_KEY=$SCW_DEPLOY_SECRET_KEY
export SCW_DEFAULT_REGION=${SCW_DEFAULT_REGION:-fr-par}
unset SCW_PROFILE SCW_API_URL

namespace_id=$(scw function namespace list name="$namespace_name" project-id="$SCW_DEFAULT_PROJECT_ID" -o json \
  | jq -r --arg name "$namespace_name" 'map(select(.name == $name))[0].id // empty')

if [ -z "$namespace_id" ]; then
  echo "Creating namespace $namespace_name"
  namespace_id=$(scw function namespace create name="$namespace_name" project-id="$SCW_DEFAULT_PROJECT_ID" -o json | jq -r .id)
fi

for _ in $(seq 60); do
  status=$(scw function namespace get "$namespace_id" -o json | jq -r .status)
  [ "$status" = ready ] && break
  [ "$status" = error ] && { echo "deploy.sh: namespace $namespace_id is in error" >&2; exit 1; }
  sleep 2
done
[ "$status" = ready ] || { echo "deploy.sh: namespace $namespace_id is still $status" >&2; exit 1; }

settings=(
  runtime="$runtime"
  handler=handler.handle
  min-scale=0
  max-scale=2
  memory-limit=128
  timeout=30s
  privacy=public
  http-option=redirected
  secret-environment-variables.0.key=TEM_SECRET_KEY
  secret-environment-variables.0.value="$SCW_TEM_SECRET_KEY"
  secret-environment-variables.1.key=TEM_PROJECT_ID
  secret-environment-variables.1.value="$SCW_DEFAULT_PROJECT_ID"
)

function_id=$(scw function function list namespace-id="$namespace_id" name="$function_name" -o json \
  | jq -r --arg name "$function_name" 'map(select(.name == $name))[0].id // empty')

if [ -z "$function_id" ]; then
  echo "Creating function $function_name"
  function_id=$(scw function function create namespace-id="$namespace_id" name="$function_name" "${settings[@]}" -o json | jq -r .id)
else
  echo "Updating function settings"
  scw function function update "$function_id" "${settings[@]}" redeploy=false -o json >/dev/null
fi

(cd "$here" && zip -q "$workdir/function.zip" handler.js contract.js package.json)

echo "Uploading and deploying code"
scw function deploy namespace-id="$namespace_id" name="$function_name" runtime="$runtime" zip-file="$workdir/function.zip" -o json >/dev/null

scw function function get "$function_id" -o json | jq -r '"status: \(.status)\nendpoint: https://\(.domain_name)"'
