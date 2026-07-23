const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});

/**
 * Waits for the database to accept connections, retrying with backoff.
 * Useful when the API container starts before Postgres is fully ready.
 */
async function waitForDb(retries = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log('Connected to PostgreSQL');
      return;
    } catch (err) {
      console.log(`Waiting for PostgreSQL... (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Could not connect to PostgreSQL after multiple attempts');
}

/**
 * Creates the tasks table if it doesn't exist, and seeds it with
 * three initial tasks only if the table is empty.
 */
async function initDb() {
  await waitForDb();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM tasks');

  if (rows[0].count === 0) {
    await pool.query(
      `INSERT INTO tasks (title, description, completed)
       VALUES
        ($1, $2, $3),
        ($4, $5, $6),
        ($7, $8, $9)`,
      [
        'Buy groceries', 'Milk, eggs, bread, and coffee', false,
        'Finish project report', 'Complete the Q3 report and send it to the team', false,
        'Book dentist appointment', 'Call the clinic and schedule a check-up', false,
      ]
    );
    console.log('Seeded tasks table with 3 initial tasks');
  } else {
    console.log('Tasks table already populated, skipping seed');
  }
}

module.exports = { pool, initDb };
