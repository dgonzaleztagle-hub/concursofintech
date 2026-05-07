# AGENTS.md - LLM Wiki Operating Schema

## Mission
Maintain a persistent, compounding personal wiki from immutable raw sources. The wiki is the primary knowledge artifact; chat answers and ingest outputs should strengthen it over time.

## Repository Scope (strict)
- This repository is a documentation vault only.
- Do not implement application functionality here (no backend, frontend, APIs, services, or product features).
- Only create and maintain knowledge artifacts: source files, wiki pages, templates, and logs.

## Architecture

### 1) Raw sources (immutable)
- Location: `raw/`
- Contains source-of-truth materials (articles, notes, transcripts, PDFs, images, exports).
- Never modify files in `raw/` except moving processed items from `raw/inbox/` to `raw/processed/` after ingest.

### 2) Wiki (mutable, LLM-maintained)
- Location: `wiki/`
- Interlinked markdown pages generated and maintained by the LLM.
- Includes topic/entity/source pages, synthesis pages, index, and log.

### 3) Schema (this file)
- Defines folder structure, conventions, and workflows for ingest, query, lint, and maintenance.
- Co-evolve this file as workflows mature.

## Required Structure
- `raw/inbox/` - new source files awaiting ingest
- `raw/processed/` - sources already ingested
- `raw/assets/` - downloaded images/attachments
- `wiki/index.md` - content catalog
- `wiki/log.md` - append-only chronological log
- `wiki/topics/` - concept/topic pages
- `wiki/entities/` - people/org/product/entity pages
- `wiki/sources/` - source summary pages
- `wiki/syntheses/` - comparisons, analyses, and derived artifacts
- `templates/` - wiki templates and prompt templates

## Global Writing Conventions
- Use concise markdown with meaningful headings.
- Prefer explicit links between related pages.
- Keep claims traceable to sources.
- Mark uncertain statements explicitly.
- Avoid duplicate pages when an existing page can be updated.

## Page Frontmatter (recommended)
Each wiki page should include YAML frontmatter:

```yaml
---
title: "Page title"
type: topic|entity|source|synthesis
status: draft|stable
last_updated: YYYY-MM-DD
source_count: 0
tags: []
---
```

## Index Contract (`wiki/index.md`)
- Organize by category (`Topics`, `Entities`, `Sources`, `Syntheses`).
- Every page entry should include:
  - Link to the page
  - One-line summary
  - Optional metadata (updated date, source count)
- Update index on every ingest when new pages are created or summaries change materially.

## Log Contract (`wiki/log.md`)
- Append-only chronological file.
- Use parseable heading format:
  - `## [YYYY-MM-DD] ingest | <Source title>`
  - `## [YYYY-MM-DD] query | <Question topic>`
  - `## [YYYY-MM-DD] lint | <Health check scope>`
- Under each heading include short bullets for changed files and key outcomes.

## Operation: Ingest
When ingesting one source:
1. Read source from `raw/inbox/` (and related assets if present).
2. Discuss or determine key takeaways and extraction targets.
3. Create/update a source page in `wiki/sources/`.
4. Update relevant pages across `wiki/topics/`, `wiki/entities/`, and `wiki/syntheses/`.
5. Add/refresh links in `wiki/index.md`.
6. Append ingest entry to `wiki/log.md` with touched pages and notable contradictions/new claims.
7. Move ingested source file to `raw/processed/` (preserving original filename).

## Operation: Query
When answering a question:
1. Read `wiki/index.md` first to locate candidate pages.
2. Read relevant pages and synthesize a cited answer.
3. If output is durable (comparison, analysis, framework), file it to `wiki/syntheses/`.
4. Add/update index entries as needed.
5. Append a `query` log entry with outputs.

## Operation: Lint
Periodically run a health check:
- Find contradictions between pages.
- Find stale claims superseded by newer sources.
- Find orphan pages (no inbound links).
- Find concepts/entities mentioned but lacking pages.
- Find missing cross-references and data gaps.
- Record suggested next sources/questions.
- Append a `lint` log entry.

## Guardrails
- Do not fabricate citations.
- Do not silently remove user-authored conclusions.
- Preserve source-path traceability for non-trivial claims.
- Prefer incremental edits over page rewrites.

