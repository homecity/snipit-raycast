import {
  Action,
  ActionPanel,
  List,
  LocalStorage,
  Clipboard,
  showHUD,
  Icon,
  Color,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useEffect, useState } from "react";

interface HistoryItem {
  id: string;
  url: string;
  title?: string;
  language: string;
  createdAt: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const history = await LocalStorage.getItem<string>("snippet-history");
    if (history) {
      setItems(JSON.parse(history));
    }
    setIsLoading(false);
  }

  async function deleteItem(id: string) {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    await LocalStorage.setItem("snippet-history", JSON.stringify(newItems));
  }

  async function clearHistory() {
    if (
      await confirmAlert({
        title: "Clear History",
        message: "Are you sure you want to clear all snippet history?",
        primaryAction: { title: "Clear", style: Alert.ActionStyle.Destructive },
      })
    ) {
      setItems([]);
      await LocalStorage.removeItem("snippet-history");
    }
  }

  return (
    <List isLoading={isLoading}>
      {items.length === 0 ? (
        <List.EmptyView
          icon={Icon.Document}
          title="No snippets yet"
          description="Create your first snippet with 'Create Snippet' command"
        />
      ) : (
        items.map((item) => (
          <List.Item
            key={item.id}
            icon={{ source: Icon.Code, tintColor: Color.Purple }}
            title={item.title || item.id}
            subtitle={item.language}
            accessories={[{ text: formatDate(item.createdAt) }]}
            actions={
              <ActionPanel>
                <Action
                  title="Copy URL"
                  icon={Icon.Clipboard}
                  onAction={async () => {
                    await Clipboard.copy(item.url);
                    await showHUD("✓ URL copied");
                  }}
                />
                <Action.OpenInBrowser title="Open in Browser" url={item.url} />
                <Action
                  title="Delete"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                  onAction={() => deleteItem(item.id)}
                />
                <Action
                  title="Clear All History"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={clearHistory}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
