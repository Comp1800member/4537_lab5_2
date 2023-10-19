/*
    I used ChatGPT to help code parts of this.
*/

const { Pool } = require('pg');
const http = require('http');

// Create a connection pool to the database
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'secret',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Set up the database
function setupDatabase() {
    // Create the patients table if it doesn't exist
    pool.query(
        `
        CREATE TABLE IF NOT EXISTS patients (
          patientId SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          dateOfBirth TIMESTAMP NOT NULL
        );
      `,
        (error, results) => {
            if (error) throw error;
        }
    );
}

// Set up the server
function setupServer() {
    // Create the HTTP server
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
            // Respond to preflight request
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            res.end();
        } else if (req.method === 'POST' && req.url === '/api/insertRows') {
            // Insert rows into the patients table
            pool.query(`
              INSERT INTO patients (name, dateOfBirth)
              VALUES
                ('Sara Brown', '1991-01-01'),
                ('Jane Smith', '1941-01-01'),
                ('Jack Ma', '1961-01-30'),
                ('Elon Musk', '1999-01-01')
            `, (error, results) => {
                if (error) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end(`Error inserting rows: ${error.message}`);
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Rows inserted successfully');
                }
            });
        } else if (req.method === 'POST' && req.url === '/api/query') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                // Parse the JSON payload from the request body
                const payload = JSON.parse(body);
                // Parse the SQL query from the request body
                const query = payload.query.trim();
                // Execute the query on the database
                console.log(query);
                pool.query(query, (error, results) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end(`Error executing query: ${error.message}`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(results));
                    }
                });
            });
        } else if (req.method === 'GET' && req.url.startsWith('/api/query/')) {
            // Extract the SQL query from the URL
            const query = decodeURIComponent(req.url);
            // Format the query string
            const formattedQuery = query.substring(12, query.length - 1);
            if (formattedQuery.startsWith('SELECT') || formattedQuery.startsWith('INSERT')) {
                // Execute the query on the database
                pool.query(formattedQuery, (error, results) => {
                    if (error) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end(`Error executing query: ${error.message}`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(results));
                    }
                });
            }
        } else {
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
        }
    });

    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}/`);
    });
}

// Set up the database and server
setupDatabase();
setupServer();
