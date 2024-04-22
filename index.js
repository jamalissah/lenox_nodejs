const { MongoClient } = require('mongodb');
const http = require('http');
const path = require('path');
const fs = require('fs');

const uri = process.env.MONGO_URI || "mongodb+srv://issah:jamal@cluster0.kmn92al.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "Lennox_DB";

const client = new MongoClient(uri);

let db;

client.connect()
    .then(connection => {
        db = connection.db(dbName);
        console.log("Connected to MongoDB");
    })
    .catch(err => console.error("Error during connection: ", err));

const server = http.createServer((request, response) => {
    const { method, url } = request;

    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8', (error, content) => {
            if (error) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end(`Error: ${error.message}`);
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(content);
            }
        });
    } else if (url === '/api') {
        findItems(db)
            .then(results => {
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(results));
            })
            .catch(error => {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end(`Error: ${error.message}`);
            });
    } else {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end('<h1>404 Not Found</h1>');
    }
});

const PORT = process.env.PORT || 3300;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

async function findItems(db) {
    const cursor = db.collection("item_collection").find({});
    return cursor.toArray();
}