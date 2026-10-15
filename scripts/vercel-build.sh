#!/bin/sh
# Vercel injects npm_config_cache_dir, which current npm rejects as unknown.
unset npm_config_cache_dir NPM_CONFIG_CACHE_DIR
exec npm run build
