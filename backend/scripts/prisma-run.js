const { execFileSync } = require('node:child_process');

execFileSync('pnpm', ['prisma', ...process.argv.slice(2)], { stdio: 'inherit', shell: true });

