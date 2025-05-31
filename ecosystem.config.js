module.exports = {
  apps: [
    {
      name: 'avail-explorer-frontend',
      script: 'npm',
      args: 'start',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      pre_start: 'npm run build',
    },
  ],
}
