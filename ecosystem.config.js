module.exports = {
  apps: [
    {
      name: 'crm',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      out_file: '/var/log/crm-out.log',
      error_file: '/var/log/crm-error.log',
      time: true,
    },
  ],
}
