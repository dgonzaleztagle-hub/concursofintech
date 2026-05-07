# Wiki Log

Append-only operational timeline.

## [2026-04-30] setup | initial llm wiki scaffold
- Created core architecture directories (`raw/`, `wiki/`, `templates/`, `scripts/`).
- Added schema and workflow contract in `AGENTS.md`.
- Added starter index and source/topic seed pages.
- Added starter ingest/query/lint scripts.

## [2026-04-30] ingest | chile legal set (19.496, 21.521, 19.628, 21.719, 21.680)
- Processed legal source files from `raw/inbox/legal/` and created 5 source pages under `wiki/sources/`.
- Created 4 linked legal topic pages under `wiki/topics/`.
- Added cross-law synthesis map at `wiki/syntheses/chile-financial-consumer-legal-map.md`.
- Updated `wiki/index.md` with new topic/source/synthesis links.
- Preserved source URL provenance in `raw/inbox/legal/sources.txt`.

## [2026-04-30] query | articulo por articulo ley 19.496 (foco financiero)
- Created `wiki/syntheses/ley-19496-article-matrix-consumidor-financiero.md` with first-pass mapping for articles `3`, `3 bis`, `12`, `16`, `17`, `17B`, `17D`, `17G`, `17L`.
- Linked matrix from `wiki/topics/chile-consumer-finance-rights.md` and `wiki/sources/ley-19496-proteccion-consumidor.md`.
- Updated `wiki/index.md` synthesis catalog.
- Flagged pending extraction for articles from current/refundido version where literal text was not yet consolidated.

## [2026-05-01] lint | wiki link quality cleanup
- Normalized legal source file references from `raw/inbox/legal/` to `raw/processed/legal/` in source pages.
- Added bidirectional links among legal topics, sources, and syntheses to strengthen navigation paths.
- Updated `wiki/index.md` metadata dates for refreshed pages.
- Kept vault scope strictly documental (no application artifacts).

## [2026-05-01] ingest | cierre de pendientes matriz ley 19.496
- Added refundido source file `raw/processed/legal/DFL-3-2021-ley-19496-refundido.pdf` for article-level contrast.
- Closed pending items for `3 bis`, `17B`, `17D`, `17G`, `17L` in `wiki/syntheses/ley-19496-article-matrix-consumidor-financiero.md`.
- Added explicit textual references to SERNAC Juridico pages for each closed article.
- Updated `wiki/index.md` synthesis descriptor to reflect stronger article coverage.

## [2026-05-01] ingest | expansion desde wiki legal chile
- Reviewed external source `https://fintech.benditaia.cl/es/wiki-legal` and added source note `wiki/sources/benditaia-wiki-legal-chile.md`.
- Downloaded expansion package into `raw/inbox/legal-expansion/` with provenance in `raw/inbox/legal-expansion/sources.txt`.
- Added synthesis backlog `wiki/syntheses/chile-legal-expansion-backlog.md` with priority ingest order and missing topic map.
- Updated `wiki/index.md` with new source and synthesis entries.

## [2026-05-01] setup | scope hardening (vault-only)
- Added explicit repository scope guardrails to `AGENTS.md`:
  - documentation vault only
  - no application functionality in this repository
- Added matching scope note in `README.md`.

## [2026-05-01] ingest | legal expansion package processed
- Processed documents from `raw/inbox/legal-expansion/` into new source pages under `wiki/sources/` (leyes 21.398, 20.555, 21.663, 21.459; NCG 502/514; SII Res. Ex. 114/2025).
- Created new topic pages under `wiki/topics/` for SERNAC financiero, ciberseguridad/ANCI, delitos informaticos, Open Finance CMF, y tributario cripto SII.
- Updated `wiki/index.md` and strengthened `wiki/syntheses/chile-financial-consumer-legal-map.md` coverage.
- Moved ingested files to `raw/processed/legal-expansion/` including `sources.txt`.


## [2026-05-01] lint | wiki health check
- Files scanned: 15
- Orphan candidates: 0
- TODO: Review contradictions, stale claims, missing concepts/entities, and weak cross-links.

## [2026-05-01] lint | wiki health check
- Files scanned: 15
- Orphan candidates: 0
- TODO: Review contradictions, stale claims, missing concepts/entities, and weak cross-links.

## [2026-05-01] lint | wiki health check
- Files scanned: 15
- Orphan candidates: 0
- TODO: Review contradictions, stale claims, missing concepts/entities, and weak cross-links.

## [2026-05-01] lint | wiki health check
- Files scanned: 17
- Orphan candidates: 0
- TODO: Review contradictions, stale claims, missing concepts/entities, and weak cross-links.

## [2026-05-01] lint | wiki health check
- Files scanned: 29
- Orphan candidates: 0
- TODO: Review contradictions, stale claims, missing concepts/entities, and weak cross-links.

## [2026-05-01] maintenance | rename vault branding to Legal Brain
- Updated `README.md` title to Legal Brain (LLM Wiki).
- Scripts under `scripts/` now default vault root to parent of `scripts/` (no hardcoded path).
- Rename folder `C:\Second Brain` → `C:\Legal Brain` manually when the editor is not locking the path; reopen workspace from the new path.
