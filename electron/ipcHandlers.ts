// ipcHandlers.ts

import { ipcMain, app } from "electron"
import { AppState } from "./main"

export function initializeIpcHandlers(appState: AppState): void {
  ipcMain.handle(
    "update-content-dimensions",
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        appState.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle("delete-screenshot", async (event, path: string) => {
    return appState.deleteScreenshot(path)
  })

  ipcMain.handle("take-screenshot", async () => {
    try {
      const screenshotPath = await appState.takeScreenshot()
      const preview = await appState.getImagePreview(screenshotPath)
      return { path: screenshotPath, preview }
    } catch (error) {
      console.error("Error taking screenshot:", error)
      throw error
    }
  })

  ipcMain.handle("get-screenshots", async () => {
    console.log({ view: appState.getView() })
    try {
      let previews = []
      if (appState.getView() === "queue") {
        previews = await Promise.all(
          appState.getScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      } else {
        previews = await Promise.all(
          appState.getExtraScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      }
      previews.forEach((preview: any) => console.log(preview.path))
      return previews
    } catch (error) {
      console.error("Error getting screenshots:", error)
      throw error
    }
  })

  ipcMain.handle("toggle-window", async () => {
    appState.toggleMainWindow()
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      appState.clearQueues()
      console.log("Screenshot queues have been cleared.")
      return { success: true }
    } catch (error: any) {
      console.error("Error resetting queues:", error)
      return { success: false, error: error.message }
    }
  })

  // Add window movement handlers
  ipcMain.handle("move-window-left", () => {
    appState.moveWindowLeft()
  })

  ipcMain.handle("move-window-right", () => {
    appState.moveWindowRight()
  })

  ipcMain.handle("move-window-up", () => {
    appState.moveWindowUp()
  })

  ipcMain.handle("move-window-down", () => {
    appState.moveWindowDown()
  })

  // Basic health endpoint info
  ipcMain.handle("get-health-endpoint", async () => {
    try {
      const healthPort = appState.healthService.getPort()
      return { 
        status: "ok", 
        port: healthPort,
        url: `http://localhost:${healthPort}`
      }
    } catch (error) {
      console.error("Error getting health status:", error)
      return { status: "error", error: String(error) }
    }
  })

  ipcMain.handle("quit-app", () => {
    app.quit()
  })
}
