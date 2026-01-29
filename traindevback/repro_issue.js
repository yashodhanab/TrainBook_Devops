const { spawn, exec } = require('child_process');

console.log("Starting server...");
const server = spawn('node', ['server.js'], { cwd: __dirname, shell: true });

server.stdout.on('data', d => console.log(`[SERVER]: ${d.toString().trim()}`));
server.stderr.on('data', d => console.error(`[SERVER ERR]: ${d.toString().trim()}`));

setTimeout(() => {
    console.log("Sending cleanup request (delete user if exists)...");
    // Attempt to delete user directly via a separate connection would be clean, but let's just assume failure or ignore duplication for now
    // Actually duplication returns 400, not 500, so that would be a success in terms of "server running".
    // 500 is what we want to catch.

    console.log("Sending POST to /signup...");
    // Using simple curl
    const cmd = `curl -X POST -H "Content-Type: application/json" -d "{\\"username\\":\\"DebugUser\\",\\"email\\":\\"debug@example.com\\",\\"password\\":\\"password123\\"}" http://localhost:5000/signup`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) console.error("CURL Command Failed:", err);
        console.log("RESPONSE BODY:", stdout);

        console.log("Killing server...");
        // Kill the server process tree
        exec(`taskkill /pid ${server.pid} /T /F`, () => {
            process.exit(0);
        });
    });
}, 5000);
