import { LocalStorage } from "@raycast/api";

export interface SnippetOptions {
  content: string;
  language: string;
  title?: string;
  expiresIn?: string;
  burnAfterRead: boolean;
  password?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  language: string;
  createdAt: string;
}

interface ApiResponse {
  id: string;
  url: string;
  error?: string;
}

export const LANGUAGES = [
  { value: "plaintext", title: "Plain Text" },
  { value: "javascript", title: "JavaScript" },
  { value: "typescript", title: "TypeScript" },
  { value: "python", title: "Python" },
  { value: "go", title: "Go" },
  { value: "rust", title: "Rust" },
  { value: "java", title: "Java" },
  { value: "c", title: "C" },
  { value: "cpp", title: "C++" },
  { value: "csharp", title: "C#" },
  { value: "php", title: "PHP" },
  { value: "ruby", title: "Ruby" },
  { value: "swift", title: "Swift" },
  { value: "kotlin", title: "Kotlin" },
  { value: "shell", title: "Shell/Bash" },
  { value: "sql", title: "SQL" },
  { value: "html", title: "HTML" },
  { value: "css", title: "CSS" },
  { value: "json", title: "JSON" },
  { value: "yaml", title: "YAML" },
  { value: "markdown", title: "Markdown" },
  { value: "dockerfile", title: "Dockerfile" },
];

export const EXPIRY_OPTIONS = [
  { value: "3600000", title: "1 hour" },
  { value: "86400000", title: "24 hours" },
  { value: "604800000", title: "1 week" },
  { value: "1209600000", title: "2 weeks" },
];

/** 1 hour in milliseconds — default for Create Env / snipit.sh /env */
export const ONE_HOUR_MS = "3600000";

export async function createSnippet(
  options: SnippetOptions,
): Promise<{ id: string; url: string }> {
  const response = await fetch("https://snipit.sh/api/snippets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: options.content,
      language: options.language,
      title: options.title || undefined,
      expiresIn: options.expiresIn ? parseInt(options.expiresIn) : undefined,
      burnAfterRead: options.burnAfterRead,
      password: options.password || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as ApiResponse;
    throw new Error(errorData.error || "Failed to create snippet");
  }

  const data = (await response.json()) as ApiResponse;
  return { id: data.id, url: `https://snipit.sh${data.url}` };
}

export async function addToHistory(item: HistoryItem) {
  const history = await LocalStorage.getItem<string>("snippet-history");
  const items: HistoryItem[] = history ? JSON.parse(history) : [];
  items.unshift(item);
  // Keep last 50 items
  await LocalStorage.setItem(
    "snippet-history",
    JSON.stringify(items.slice(0, 50)),
  );
}
