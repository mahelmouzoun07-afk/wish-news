import cors from "cors";
import express from "express";
import type { NewsArticle } from "../../shared/src";
import { NewsAggregator } from "./aggregator";

const PORT = Number(process.env.PORT ?? 4000);
const REFRESH_MS = Number(process.env.REFRESH_MINUTES ?? 5) * 60 * 1000;

const app = express();
const aggregator = new NewsAggregator();
aggregator.setMaxListeners(0);

app.use(cors());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ...aggregator.status() });
});

app.get("/api/news", (req, res) => {
  const { category, q, source } = req.query as Record<string, string | undefined>;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);
  res.json(aggregator.store.list({ category, q, source, limit, offset }));
});

app.get("/api/news/:id", (req, res) => {
  const article = aggregator.store.get(req.params.id);
  if (!article) return res.status(404).json({ error: "Article introuvable" });
  res.json(article);
});

app.get("/api/digest", (_req, res) => {
  res.json(aggregator.store.digest());
});

app.get("/api/sources", (_req, res) => {
  res.json(aggregator.store.sourceList());
});

// Server-Sent Events: clients keep this connection open and receive new articles as soon as they're fetched.
app.get("/api/stream", (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify(aggregator.status())}\n\n`);

  const onNew = (articles: NewsArticle[]) => {
    res.write(`event: new-articles\ndata: ${JSON.stringify(articles)}\n\n`);
  };
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);
  aggregator.on("new-articles", onNew);
  req.on("close", () => {
    clearInterval(heartbeat);
    aggregator.off("new-articles", onNew);
  });
});

app.post("/api/refresh", async (_req, res) => {
  const fresh = await aggregator.refresh();
  res.json({ added: fresh.length });
});

app.listen(PORT, async () => {
  console.log(`Wish backend sur http://localhost:${PORT}`);
  await aggregator.refresh();
  setInterval(() => aggregator.refresh().catch((e) => console.error("[refresh]", e)), REFRESH_MS);
});
