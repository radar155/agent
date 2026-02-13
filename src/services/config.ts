import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

const sandboxMode = (process.env.SANDBOX_MODE || "local") as "local" | "docker";

export const config = {
  sandbox: {
    mode: sandboxMode,
    workingDirectory: process.env.SANDBOX_WORKING_DIR || "./workspace",
    timeout: parseInt(process.env.SANDBOX_TIMEOUT || "30000", 10),
    blacklist: sandboxMode === "docker"
      ? [] // In Docker l'ambiente è isolato, nessuna blacklist necessaria
      : [
          "rm -rf /",
          "rm -rf /*",
          "dd if=",
          ":(){ :|:& };:",
          "mkfs",
          "chmod -R 777 /",
          "> /dev/sda",
          "mv /* /dev/null",
        ],
  },
  docker: {
    imageName: process.env.DOCKER_IMAGE || "agent-sandbox",
    containerName: process.env.DOCKER_CONTAINER_NAME || "agent-sandbox",
    hostWorkspacePath: path.resolve(process.env.DOCKER_HOST_WORKSPACE || "./workspace"),
    containerWorkspacePath: process.env.DOCKER_CONTAINER_WORKSPACE || "/workspace",
  },
  fileSystem: {
    workspacePath: process.env.WORKSPACE_PATH || "./workspace",
    outputsPath: process.env.OUTPUTS_PATH || "./outputs",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "104857600", 10),
    encoding: "utf-8" as BufferEncoding,
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
  },
};
