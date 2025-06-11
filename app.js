const http = require('http');
const fs = require('fs');
const os = require('os');
const {exec} = require('child_process');
const crypto = require('crypto');
const {URL} = require('url');

const PORT = process.env.PORT || 3001;
const UUID = process.env.UUID || '';

function generateTempFilePath() {
    const randomStr = crypto.randomBytes(6).toString('hex');
    return `${os.tmpdir()}/wsr-${randomStr}.sh`;
}

function executeScript(script, callback) {
    const scriptPath = generateTempFilePath();
    fs.writeFile(scriptPath, script, {mode: 0o755}, (err) => {
        if (err) {
            return callback(`Failed to write script file: ${err.message}`);
        }

        exec(`sh "${scriptPath}"`, {timeout: 10000}, (error, stdout, stderr) => {

            // clean up temp file
            fs.unlink(scriptPath, () => {
            });

            if (error) {
                return callback(stderr);
            }

            callback(null, stdout);
        });
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    const expectedPath = UUID ? `/${UUID}/run` : '/run';

    if (parsedUrl.pathname !== expectedPath) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        return res.end('Not Found');
    }

    if (req.method !== 'POST') {
        res.writeHead(405, {'Content-Type': 'text/plain'});
        return res.end('Method Not Allowed');
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
        // Preventing large request attacks
        if (body.length > 1e6) {
            req.connection.destroy();
        }
    });

    req.on('end', () => {
        executeScript(body, (err, output) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                return res.end(err);
            }
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(output);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
