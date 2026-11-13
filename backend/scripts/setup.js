#!/usr/bin/env node

/**
 * RSVP Backend Setup Wizard
 * Guides you through configuring MongoDB Atlas, Admin Password, JWT Secrets, and CORS.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(`${question}: `);
    const stdin = process.stdin;
    const oldRaw = stdin.isRaw;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();

    let password = '';
    const onData = (char) => {
      char = char.toString();
      if (char === '\n' || char === '\r' || char === '\u0004') {
        stdin.removeListener('data', onData);
        if (stdin.isTTY) stdin.setRawMode(oldRaw);
        process.stdout.write('\n');
        resolve(password.trim());
      } else if (char === '\u0003') {
        process.exit(1);
      } else if (char === '\b' || char === '\x7f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    };

    stdin.on('data', onData);
  });
}

async function testMongoConnection(uri) {
  process.stdout.write('\nTesting connection to MongoDB Atlas... ');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('\x1b[32mSUCCESS!\x1b[0m ✓ Connected to MongoDB successfully.');
    await conn.disconnect();
    return true;
  } catch (err) {
    console.log('\x1b[31mFAILED!\x1b[0m ✗');
    console.error(`\x1b[33mConnection Error: ${err.message}\x1b[0m`);
    console.log('Tip: Ensure you have added 0.0.0.0/0 to your MongoDB Atlas Network Access whitelist,');
    console.log('and verify your username, password, and cluster host.\n');
    return false;
  }
}

async function runSetup() {
  console.log('\n======================================================');
  console.log('       RSVP Backend & MongoDB Setup Wizard            ');
  console.log('======================================================\n');
  console.log('This wizard will configure your database connection,');
  console.log('admin credentials, and security settings in .env.\n');

  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const overwrite = await ask('.env file already exists. Overwrite? (y/n)', 'y');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup aborted. Existing .env preserved.');
      rl.close();
      return;
    }
  }

  console.log('\n--- 1. MongoDB Atlas Configuration ---');
  console.log('How would you like to provide your MongoDB connection?');
  console.log('  1) Paste full Connection String (URI)');
  console.log('  2) Enter username, password, and cluster address step-by-step');

  const choice = await ask('Choose option (1 or 2)', '1');

  let mongoUri = '';

  if (choice === '1') {
    while (!mongoUri) {
      mongoUri = await ask('\nEnter MongoDB Connection URI\n(e.g., mongodb+srv://user:pass@cluster0.abc.mongodb.net/wedding_rsvp?retryWrites=true&w=majority)');
      if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        console.log('\x1b[31mInvalid URI. Must start with mongodb:// or mongodb+srv://\x1b[0m');
        mongoUri = '';
      }
    }
  } else {
    const username = await ask('MongoDB Atlas Username');
    const rawPassword = await askHidden('MongoDB Atlas Password');
    const encodedPassword = encodeURIComponent(rawPassword);
    const cluster = await ask('Cluster address (e.g. cluster0.abcde.mongodb.net)');
    const dbName = await ask('Database name', 'wedding_rsvp');

    mongoUri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${dbName}?retryWrites=true&w=majority`;
  }

  // Test the connection
  const isConnected = await testMongoConnection(mongoUri);
  if (!isConnected) {
    const proceed = await ask('Connection test failed. Save this configuration anyway? (y/n)', 'n');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Please re-run npm run setup with correct credentials.');
      rl.close();
      process.exit(1);
    }
  }

  console.log('\n--- 2. Admin Monitoring Dashboard Security ---');
  console.log('Set a password to log into the monitoring dashboard.');
  let adminPassword = '';
  while (!adminPassword || adminPassword.length < 6) {
    adminPassword = await askHidden('Enter Admin Dashboard Password (min 6 characters)');
    if (adminPassword.length < 6) {
      console.log('\x1b[31mPassword must be at least 6 characters long.\x1b[0m');
    }
  }

  // Hash admin password
  console.log('Hashing admin password with bcrypt...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, salt);

  console.log('\n--- 3. Network & CORS Settings ---');
  const port = await ask('Server Port', '5000');
  const allowedOrigins = await ask(
    'Allowed Frontend Origins (comma-separated, or * to allow any)',
    '*'
  );

  // Generate secure JWT secret
  const jwtSecret = crypto.randomBytes(32).toString('hex');

  // Build .env content
  const envContent = `# RSVP Backend Configuration
# Generated on ${new Date().toISOString()}

PORT=${port}
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=${mongoUri}

# Admin Authentication
ADMIN_PASSWORD_HASH=${adminPasswordHash}
JWT_SECRET=${jwtSecret}

# CORS Allowed Origins
ALLOWED_ORIGINS=${allowedOrigins}
`;

  fs.writeFileSync(envPath, envContent, 'utf8');

  console.log('\n\x1b[32m======================================================');
  console.log('   Setup Complete! .env file created successfully!    ');
  console.log('======================================================\x1b[0m\n');
  console.log('Next steps:');
  console.log('  1. Start the backend:');
  console.log('     \x1b[36mnpm start\x1b[0m  (or \x1b[36mnpm run dev\x1b[0m for development with auto-reload)');
  console.log('  2. Open the monitoring dashboard:');
  console.log('     Double click \x1b[36mmonitoring/dashboard.html\x1b[0m in your browser.');
  console.log('  3. In your RSVP frontend website, set:');
  console.log(`     \x1b[36mNEXT_PUBLIC_API_URL=http://localhost:${port}\x1b[0m\n`);

  rl.close();
}

runSetup().catch((err) => {
  console.error('\nSetup error:', err);
  rl.close();
  process.exit(1);
});

