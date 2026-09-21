import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import {
  EXPIRY_OPTIONS,
  ONE_HOUR_MS,
  createSnippet,
  addToHistory,
} from "./lib/snipit";

/**
 * Create Env — matches snipit.sh /env and CLI `snipit env`:
 * burn-after-read ON + 1h expiry by default.
 */
export default function CreateEnv() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [expiresIn, setExpiresIn] = useState(ONE_HOUR_MS);
  const [burnAfterRead, setBurnAfterRead] = useState(true);
  const [password, setPassword] = useState("");

  useEffect(() => {
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
      showToast({ style: Toast.Style.Animated, title: "Creating env paste..." });

      const result = await createSnippet({
        content,
        language: "plaintext",
        title: title || undefined,
        expiresIn,
        burnAfterRead,
        password: password || undefined,
      });

      await Clipboard.copy(result.url);
      await addToHistory({
        id: result.id,
        url: result.url,
        title: title || ".env",
        language: "plaintext",
        createdAt: new Date().toISOString(),
      });

      await showHUD(`✓ Copied: ${result.url}`);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to create env paste",
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
      <Form.Description text="One-time .env / secrets paste. Defaults: burn-after-read on, 1 hour expiry (same as snipit.sh /env)." />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Paste .env, API keys, or secrets here..."
        value={content}
        onChange={setContent}
      />
      <Form.TextField
        id="title"
        title="Title"
        placeholder="Optional title (e.g. staging.env)"
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
