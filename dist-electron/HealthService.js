"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const http_1 = __importDefault(require("http"));
class HealthService {
    server = null;
    port = 43210; // Default port
    appState;
    constructor(appState, port) {
        this.appState = appState;
        if (port) {
            this.port = port;
        }
    }
    start() {
        if (this.server) {
            console.log("Health server is already running");
            return;
        }
        this.server = http_1.default.createServer((req, res) => {
            // Set basic headers
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "application/json");
            // Simple health check endpoint
            res.writeHead(200);
            res.end(JSON.stringify({
                status: "ok",
                timestamp: new Date().toISOString()
            }));
        });
        this.server.listen(this.port, () => {
            const address = this.server?.address();
            console.log(`Health service is running on http://localhost:${address.port}`);
        });
        // Handle server errors
        this.server.on("error", (e) => {
            console.error("Health server error:", e);
            // If port is in use, try another port
            if (e.code === "EADDRINUSE") {
                console.log(`Port ${this.port} is in use, trying ${this.port + 1}`);
                this.port++;
                setTimeout(() => {
                    if (this.server) {
                        this.server.close();
                        this.server = null;
                        this.start();
                    }
                }, 1000);
            }
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
            console.log("Health service stopped");
        }
    }
    getPort() {
        return this.port;
    }
}
exports.HealthService = HealthService;
//# sourceMappingURL=HealthService.js.map