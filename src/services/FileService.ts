import * as fs from "fs";
import * as path from "path";
import { config } from "./config.js";

export interface FileResult {
  success: boolean;
  output: string;
  error?: string;
}

export class FileService {
  private workspacePath: string;
  private outputsPath: string;
  private maxFileSize: number;
  private encoding: BufferEncoding;

  constructor(options?: {
    workspacePath?: string;
    outputsPath?: string;
    maxFileSize?: number;
    encoding?: BufferEncoding;
  }) {
    this.workspacePath = options?.workspacePath ?? config.fileSystem.workspacePath;
    this.outputsPath = options?.outputsPath ?? config.fileSystem.outputsPath;
    this.maxFileSize = options?.maxFileSize ?? config.fileSystem.maxFileSize;
    this.encoding = options?.encoding ?? config.fileSystem.encoding;
  }

  validatePath(filePath: string): string {
    const normalized = path.normalize(filePath);
    if (normalized.includes("..") || filePath.includes("..") || path.isAbsolute(filePath)) {
      throw new Error("Path traversal detected: Invalid path");
    }
    const resolved = path.resolve(this.workspacePath, normalized);
    if (!resolved.startsWith(path.resolve(this.workspacePath))) {
      throw new Error("Path traversal detected: Path escapes workspace");
    }
    return resolved;
  }

  ensureWorkspace(): void {
    if (!fs.existsSync(this.workspacePath)) {
      fs.mkdirSync(this.workspacePath, { recursive: true });
    }
  }

  ensureOutputs(): void {
    if (!fs.existsSync(this.outputsPath)) {
      fs.mkdirSync(this.outputsPath, { recursive: true });
    }
  }

  createFile(filePath: string, content: string): FileResult {
    try {
      const resolved = this.validatePath(filePath);
      const size = Buffer.byteLength(content, this.encoding);
      if (size > this.maxFileSize) {
        return { success: false, output: "", error: `File size exceeds maximum (${this.maxFileSize} bytes)` };
      }
      const parentDir = path.dirname(resolved);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(resolved, content, { encoding: this.encoding });
      return { success: true, output: `File created: ${filePath}` };
    } catch (error) {
      return { success: false, output: "", error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  readFile(filePath: string): FileResult {
    try {
      const resolved = this.validatePath(filePath);
      if (!fs.existsSync(resolved)) {
        return { success: false, output: "", error: `File not found: ${filePath}` };
      }
      const stats = fs.statSync(resolved);
      if (stats.isDirectory()) {
        return { success: false, output: "", error: `Path is a directory: ${filePath}` };
      }
      if (stats.size > this.maxFileSize) {
        return { success: false, output: "", error: `File too large (${stats.size} bytes)` };
      }
      const content = fs.readFileSync(resolved, { encoding: this.encoding });
      return { success: true, output: content };
    } catch (error) {
      return { success: false, output: "", error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  listDirectory(dirPath: string = ""): FileResult {
    try {
      const resolved = dirPath ? this.validatePath(dirPath) : this.workspacePath;
      if (!fs.existsSync(resolved)) {
        return { success: false, output: "", error: `Directory not found: ${dirPath || "/"}` };
      }
      const stats = fs.statSync(resolved);
      if (!stats.isDirectory()) {
        return { success: false, output: "", error: `Not a directory: ${dirPath}` };
      }
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      const listing = entries.map((e) => `${e.isDirectory() ? "[DIR]" : "[FILE]"} ${e.name}`);
      return { success: true, output: listing.length > 0 ? listing.join("\n") : "(empty)" };
    } catch (error) {
      return { success: false, output: "", error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  replaceInFile(filePath: string, oldStr: string, newStr: string): FileResult {
    const readResult = this.readFile(filePath);
    if (!readResult.success) return readResult;
    if (!readResult.output.includes(oldStr)) {
      return { success: false, output: "", error: `String not found: "${oldStr.substring(0, 50)}..."` };
    }
    return this.createFile(filePath, readResult.output.replace(oldStr, newStr));
  }

  copyToOutputs(filePath: string): FileResult {
    try {
      const sourcePath = this.validatePath(filePath);
      if (!fs.existsSync(sourcePath)) {
        return { success: false, output: "", error: `File not found: ${filePath}` };
      }
      const stats = fs.statSync(sourcePath);
      if (stats.isDirectory()) {
        return { success: false, output: "", error: `Cannot copy directory: ${filePath}` };
      }
      
      this.ensureOutputs();
      const filename = path.basename(filePath);
      const destPath = path.join(this.outputsPath, filename);
      fs.copyFileSync(sourcePath, destPath);
      
      // Ritorna URL relativo per il download
      return { success: true, output: `/outputs/${filename}` };
    } catch (error) {
      return { success: false, output: "", error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  getWorkspacePath(): string {
    return this.workspacePath;
  }

  getOutputsPath(): string {
    return this.outputsPath;
  }
}
