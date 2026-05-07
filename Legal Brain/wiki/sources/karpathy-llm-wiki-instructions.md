---
title: "Karpathy - LLM Wiki Instructions"
type: source
status: stable
last_updated: 2026-04-30
source_count: 1
tags: [llm-wiki, workflow, architecture]
---

# Summary
- Contrasts standard query-time RAG with a persistent wiki that accumulates synthesis over time.
- Defines three layers: immutable raw sources, mutable LLM-maintained wiki, and schema/config file.
- Recommends explicit ingest/query/lint operations with index and append-only logging.

# Key Extracted Claims
- Knowledge should be compiled once into the wiki and continuously maintained, not rediscovered per query.
- The LLM should own wiki writing and maintenance, while the human curates sources and directs analysis.
- Durable query outputs (comparisons, analyses, decks, canvases) should be filed back into the wiki.
- `index.md` is content-oriented navigation; `log.md` is chronological operational history.

# Operational Guidance
- Ingest one source at a time when quality control is preferred.
- Use lint passes to detect contradictions, stale claims, orphan pages, and missing cross-references.
- Keep markdown pages interlinked and citation-friendly.

# Related
- [LLM Wiki Pattern](../topics/llm-wiki-pattern.md)

