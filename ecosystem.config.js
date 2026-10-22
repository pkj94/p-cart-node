// PM2 process file. Install once on the server: npm install -g pm2
// Start: npm run pm2:start   Zero-downtime reload after a deploy: npm run pm2:reload
// Survive reboots: pm2 save && pm2 startup
module.exports = {
    apps: [{
        name: 'p-cart',
        script: 'index.js',
        cwd: __dirname,
        // Sessions are in MySQL, so several processes can share the load: set WEB_CONCURRENCY=max (one per CPU)
        exec_mode: 'cluster',
        instances: process.env.WEB_CONCURRENCY || 1,
        // Matches the 10s graceful shutdown in index.js
        kill_timeout: 10000,
        max_memory_restart: '512M',
        out_file: 'system/storage/logs/pm2-out.log',
        error_file: 'system/storage/logs/pm2-error.log',
        time: true,
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
};
