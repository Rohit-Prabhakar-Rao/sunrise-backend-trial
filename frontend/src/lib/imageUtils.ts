/**
 * Image utility functions for handling image source selection and path construction
 */

// Web image formats that can be displayed in browsers
const WEB_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
]);

// Runtime configuration cache
interface RuntimeConfig {
  imageSource?: string;
  imageBasePath?: string;
}

let runtimeConfig: RuntimeConfig | null = null;
let configLoadPromise: Promise<RuntimeConfig> | null = null;

/**
 * Loads runtime configuration from config.json
 * Falls back to environment variables if config.json is not available
 * @returns Promise that resolves to the runtime config
 */
async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // Return cached config if already loaded
  if (runtimeConfig !== null) {
    return runtimeConfig;
  }

  // Return existing promise if already loading
  if (configLoadPromise !== null) {
    return configLoadPromise;
  }

  // Start loading config
  configLoadPromise = (async () => {
    try {
      const response = await fetch('/config.json');
      if (response.ok) {
        const config = await response.json();
        runtimeConfig = {
          imageSource: config.imageSource,
          imageBasePath: config.imageBasePath,
        };
        return runtimeConfig;
      }
    } catch (error) {
      console.warn('Failed to load config.json, using environment variables or defaults:', error);
    }

    // Fallback to environment variables or defaults
    runtimeConfig = {
      imageSource: import.meta.env.VITE_IMAGE_SOURCE || "SampleImages",
      imageBasePath: import.meta.env.VITE_IMAGE_BASE_PATH || "",
    };
    return runtimeConfig;
  })();

  return configLoadPromise;
}

/**
 * Gets the image source field name from runtime config or environment variable
 * @returns "SampleImages" or "Images" based on config, defaults to "SampleImages"
 */
export async function getImageSource(): Promise<"SampleImages" | "Images"> {
  const config = await loadRuntimeConfig();
  const source = config.imageSource || import.meta.env.VITE_IMAGE_SOURCE;
  if (source === "Images" || source === "SampleImages") {
    return source;
  }
  return "SampleImages"; // Default fallback
}

/**
 * Checks if a filename has a web image format extension
 * @param filename - The filename to check (can include path)
 * @returns true if the file has a web image extension, false otherwise
 */
export function isWebImageFormat(filename: string): boolean {
  if (!filename) return false;
  
  // Extract extension (case-insensitive)
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return false;
  
  const extension = filename.substring(lastDot + 1).toLowerCase();
  return WEB_IMAGE_EXTENSIONS.has(extension);
}

/**
 * Normalizes a Windows path by converting backslashes to forward slashes
 * and handling UNC paths
 * @param path - Windows file path
 * @returns Normalized path with forward slashes
 */
function normalizePath(path: string): string {
  if (!path) return "";
  
  // Handle UNC paths (\\server\share)
  if (path.startsWith("\\\\")) {
    // Keep the double backslash, convert rest to forward slashes
    return "//" + path.substring(2).replace(/\\/g, "/");
  }
  
  // Convert backslashes to forward slashes for local paths
  return path.replace(/\\/g, "/");
}

/**
 * Builds a full image path by combining base path with image filename
 * Handles Windows paths, spaces, and URL encoding
 * @param imagePath - Relative image path or filename
 * @returns Promise that resolves to full path with base prefix, properly encoded for URLs
 */
export async function buildImagePath(imagePath: string): Promise<string> {
  if (!imagePath) return "";
  
  // Filter out non-web image formats
  if (!isWebImageFormat(imagePath)) {
    return ""; // Return empty string to indicate this should be filtered out
  }
  
  const config = await loadRuntimeConfig();
  const basePath = config.imageBasePath || import.meta.env.VITE_IMAGE_BASE_PATH;
  
  // If no base path is configured, return the image path as-is (normalized)
  if (!basePath || basePath.trim() === "") {
    return normalizePath(imagePath);
  }
  
  // Normalize both paths
  const normalizedBase = normalizePath(basePath.trim());
  const normalizedImage = normalizePath(imagePath.trim());
  
  // Ensure base path ends with a slash
  const baseWithSlash = normalizedBase.endsWith("/") 
    ? normalizedBase 
    : normalizedBase + "/";
  
  // Remove leading slash from image path if present
  const imageWithoutLeadingSlash = normalizedImage.startsWith("/")
    ? normalizedImage.substring(1)
    : normalizedImage;
  
  // Combine paths
  const fullPath = baseWithSlash + imageWithoutLeadingSlash;
  
  // URL encode the path to handle spaces and special characters
  // Split by / to encode each segment separately, preserving slashes
  const pathSegments = fullPath.split("/");
  const encodedSegments = pathSegments.map(segment => {
    // Don't encode the segment if it's empty (for leading/trailing slashes)
    if (!segment) return segment;
    // Encode the segment but keep forward slashes
    return encodeURIComponent(segment);
  });
  
  return encodedSegments.join("/");
}

