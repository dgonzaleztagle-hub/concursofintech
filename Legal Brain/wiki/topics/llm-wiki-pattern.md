---
title: "LLM Wiki Pattern"
type: topic
status: draft
last_updated: 2026-04-30
source_count: 1
tags: [knowledge-management, llm, wiki]
---

# Core Idea
An LLM incrementally builds and maintains a persistent wiki from raw sources, creating a compounding knowledge artifact instead of re-deriving answers from scratch on each question.

# Why It Works
- Cross-references and synthesis persist across sessions.
- Contradictions can be tracked and resolved over time.
- Maintenance burden shifts from humans to the LLM agent.

# Operating Model
- Human: source curation, direction, evaluation, interpretation.
- LLM: summarization, extraction, cross-linking, updates, and bookkeeping.

# Key Files
- Index: [Wiki Index](../index.md)
- Log: [Wiki Log](../log.md)
- Primary source note: [Karpathy - LLM Wiki Instructions](../sources/karpathy-llm-wiki-instructions.md)

# Open Questions
- When should ingestion be batched versus one-by-one?
- Which lint checks should be automated first?

