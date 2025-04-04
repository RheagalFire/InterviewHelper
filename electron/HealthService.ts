import http from "http"
import { AddressInfo } from "net"
import { AppState } from "./main"

export class HealthService {
  private server: http.Server | null = null
  private port: number = 43210 // Default port
  private appState: AppState

  constructor(appState: AppState, port?: number) {
    this.appState = appState
    if (port) {
      this.port = port
    }
  }

  public start(): void {
    if (this.server) {
      console.log("Health server is already running")
      return
    }

    this.server = http.createServer((req, res) => {
      // Set basic headers
      res.setHeader("Access-Control-Allow-Origin", "*")
      res.setHeader("Content-Type", "application/json")
      
      // Simple health check endpoint
      res.writeHead(200)
      res.end(JSON.stringify({ 
        status: "ok",
        timestamp: new Date().toISOString()
      }))
    })

    this.server.listen(this.port, () => {
      const address = this.server?.address() as AddressInfo
      console.log(`Health service is running on http://localhost:${address.port}`)
    })

    // Handle server errors
    this.server.on("error", (e) => {
      console.error("Health server error:", e)
      // If port is in use, try another port
      if ((e as NodeJS.ErrnoException).code === "EADDRINUSE") {
        console.log(`Port ${this.port} is in use, trying ${this.port + 1}`)
        this.port++
        setTimeout(() => {
          if (this.server) {
            this.server.close()
            this.server = null
            this.start()
          }
        }, 1000)
      }
    })
  }

  public stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
      console.log("Health service stopped")
    }
  }

  public getPort(): number {
    return this.port
  }
} 