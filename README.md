# wsr (Web Shell Runner)

**Web Shell Runner** is a lightweight HTTP service built with Node.js that allows executing shell scripts via HTTP POST requests. It is intended for **controlled internal use**, such as remote management, automation, or CI/CD hooks.

> ⚠️ **Warning:** Running arbitrary shell scripts via HTTP is inherently dangerous. You must secure access using a UUID or restrict access via firewall or authentication proxy.

---

## ✨ Features

- Execute shell scripts received from HTTP requests.
- Automatically generates and runs temporary `.sh` script files.
- Supports custom port and path prefix (via UUID).
- Logs output or error directly to the HTTP response.
- Written in pure Node.js, with no dependencies.

---

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/vevc/wsr.git
cd web-shell-runner
```

### 2. Install Node.js dependencies

No dependencies are needed — uses built-in `http`, `fs`, `os`, `url`, `child_process`, `crypto`.

### 3. Run the server

```bash
# Basic usage (open access on /run)
node app.js

# Secure usage with UUID
UUID=my-secret-token PORT=8080 node app.js
```

------

## 🔐 Security

To prevent unauthorized access, set a secret UUID as part of the URL path:

```bash
UUID=my-secret-token node app.js
```

Then access it like this:

```
POST http://localhost:3001/my-secret-token/run
```

If `UUID` is **not** set, the endpoint will be accessible via:

```
POST http://localhost:3001/run
```

**Do not expose this service to the public internet without proper protections.**

------

## 📦 Environment Variables

| Variable | Default   | Description                                         |
| -------- | --------- | --------------------------------------------------- |
| `PORT`   | `3001`    | Port to run the HTTP server                         |
| `UUID`   | *(empty)* | Optional secret token to secure the `/run` endpoint |

------

## 📬 Example Request

```bash
curl -X POST http://localhost:3001/my-secret-token/run \
  -H "Content-Type: text/plain" \
  --data-binary 'echo Hello from Web Shell Runner'
```

------

## 🧹 Notes

- Each script is saved to a temporary `.sh` file and auto-deleted after execution.
- Output (`stdout`/`stderr`) is returned as the HTTP response.
- Script execution timeout is 10 seconds (configurable in code).

------

## 📄 License

MIT License. Use at your own risk.

