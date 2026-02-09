import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  sandbox: {
    workingDirectory: process.env.SANDBOX_WORKING_DIR || "./workspace",
    timeout: parseInt(process.env.SANDBOX_TIMEOUT || "30000", 10),
    blacklist: [
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
