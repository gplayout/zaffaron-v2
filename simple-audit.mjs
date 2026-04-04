// Simple audit to run 5-gate check
import { execSync } from 'child_process';

try {
  console.log('Running 5-gate audit...');
  const result = execSync('node scripts/audit-5gate.mjs', { 
    cwd: 'C:\\Users\\Mehdi\\Desktop\\Projects\\zaffaron-v2',
    encoding: 'utf-8'
  });
  console.log('5-gate audit result:');
  console.log(result);
} catch (error) {
  console.error('Error running 5-gate audit:', error.message);
}