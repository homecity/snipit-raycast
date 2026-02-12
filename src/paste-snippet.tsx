import {
  Action,
  ActionPanel,
  Form,
  showToast,
  Toast,
  Clipboard,
  showHUD,
} from "@raycast/api";
import { useState } from "react";

interface SnippetResponse {
  content: string;
  language?: string;
  title?: string;
}

export default function PasteSnippet() {
  const [url, setUrl] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit() {
    if (!url.trim()) {
      showToast({ style: Toast.Style.Failure, title: "URL is required" });
      return;
    }

    try {
      showToast({ style: Toast.Style.Animated, title: "Fetching snippet..." });

      // Extract ID from URL
      const match = url.match(/snipit\.sh\/([a-zA-Z0-9_-]+)/);
      if (!match) {
        throw new Error("Invalid snipit.sh URL");
      }
      const id = match[1];

      const apiUrl = password
        ? `https://snipit.sh/api/snippets/${id}?password=${encodeURIComponent(password)}`
        : `https://snipit.sh/api/snippets/${id}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Password required or incorrect");
        }
        throw new Error("Failed to fetch snippet");
      }

      const data = (await response.json()) as SnippetResponse;
      await Clipboard.paste(data.content);
      await showHUD("✓ Snippet pasted");
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch snippet",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Fetch & Paste" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="Snippet URL"
        placeholder="https://snipit.sh/abc123"
        value={url}
        onChange={setUrl}
      />
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="If password protected"
        value={password}
        onChange={setPassword}
      />
    </Form>
  );
}
