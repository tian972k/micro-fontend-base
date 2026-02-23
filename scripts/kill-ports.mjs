#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORTS = [8000, 8001, 8002, 8003, 8004, 8005];

async function killPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);
    
    if (pids.length === 0) {
      return;
    }

    for (const pid of pids) {
      try {
        await execAsync(`kill -9 ${pid}`);
        console.log(`✅ Killed process ${pid} on port ${port}`);
      } catch (err) {
        // Process might already be dead
      }
    }
  } catch (err) {
    // No process on this port
  }
}

async function main() {
  console.log('🔍 Checking ports 8000-8005...\n');
  
  for (const port of PORTS) {
    await killPort(port);
  }
  
  console.log('\n✅ All ports cleared!');
}

main().catch(console.error);
