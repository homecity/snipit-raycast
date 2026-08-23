import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  showHUD,
  showToast,
  Toast,
  LocalStorage,
} from "@raycast/api";
import { useState, useEffect } from "react";

interface SnippetOptions {
  content: string;
  language: string;
  title?: string;
  expiresIn?: string;
  burnAfterRead: boolean;
  password?: string;
}

interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  language: string;
  createdAt: string;
}

const LANGUAGES = [
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

const EXPIRY_OPTIONS = [
  { value: "3600000", title: "1 hour" },
  { value: "86400000", title: "24 hours" },
  { value: "604800000", title: "1 week" },
  { value: "1209600000", title: "2 weeks" },
];

interface ApiResponse {
  id: string;
  url: string;
  error?: string;
}

async function createSnippet(
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

async function addToHistory(item: HistoryItem) {
  const history = await LocalStorage.getItem<string>("snippet-history");
  const items: HistoryItem[] = history ? JSON.parse(history) : [];
  items.unshift(item);
  // Keep last 50 items
  await LocalStorage.setItem(
    "snippet-history",
    JSON.stringify(items.slice(0, 50)),
  );
}

export default function CreateSnippet() {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [title, setTitle] = useState("");
  const [expiresIn, setExpiresIn] = useState("86400000");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Auto-fill from clipboard
    Clipboard.readText().then((text) => {
      if (text) setContent(text);
    });
  }, []);

  async function handleSubmit() {
    if (!content.trim()) {
      showToast({ style: Toast.Style.Failure, title: "Content is required" });
      return;
    }

    try {
      showToast({ style: Toast.Style.Animated, title: "Creating snippet..." });

      const result = await createSnippet({
        content,
        language,
        title: title || undefined,
        expiresIn,
        burnAfterRead,
        password: password || undefined,
      });

      await Clipboard.copy(result.url);
      await addToHistory({
        id: result.id,
        url: result.url,
        title: title || undefined,
        language,
        createdAt: new Date().toISOString(),
      });

      await showHUD(`✓ Copied: ${result.url}`);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create snippet",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create & Copy URL"
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Paste your code or text here..."
        value={content}
        onChange={setContent}
      />
      <Form.Dropdown
        id="language"
        title="Language"
        value={language}
        onChange={setLanguage}
      >
        {LANGUAGES.map((lang) => (
          <Form.Dropdown.Item
            key={lang.value}
            value={lang.value}
            title={lang.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Optional title"
        value={title}
        onChange={setTitle}
      />
      <Form.Dropdown
        id="expiresIn"
        title="Expires In"
        value={expiresIn}
        onChange={setExpiresIn}
      >
        {EXPIRY_OPTIONS.map((opt) => (
          <Form.Dropdown.Item
            key={opt.value}
            value={opt.value}
            title={opt.title}
          />
        ))}
      </Form.Dropdown>
      <Form.Checkbox
        id="burnAfterRead"
        label="Burn after read"
        value={burnAfterRead}
        onChange={setBurnAfterRead}
      />
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="Optional password protection"
        value={password}
        onChange={setPassword}
      />
    </Form>
  );
}
