/**
 * PM2 Production Cluster Configuration for LEVIX Streetwear on Hostinger VPS
 */
module.exports = {
  apps: [
    {
      name: 'levix-storefront',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 'max', // Spawns one worker per available CPU core
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G', // Automatically recycles worker if memory exceeds 1GB
      listen_timeout: 10000,    // Wait up to 10s for worker to listen before routing traffic
      kill_timeout: 5000,      // Grace period for in-flight checkouts to finish before termination
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/levix/pm2-error.log',
      out_file: '/var/log/levix/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
