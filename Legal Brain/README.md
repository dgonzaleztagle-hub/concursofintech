# Legal Brain (LLM Wiki)

Second brain de archivos legales relacionados a la legislación financiera chilena. Base de conocimiento local-first con el patrón LLM Wiki.

## Scope
This repository is a documentation vault only. It does not host product/application functionality.

## Layers
- `raw/`: immutable source materials
- `wiki/`: persistent, interlinked markdown knowledge base
- `AGENTS.md`: workflow/schema contract that governs maintenance

## Workflow
1. Add new documents to `raw/inbox/`
2. Ingest source into wiki pages
3. Update `wiki/index.md`
4. Append entry to `wiki/log.md`
5. Move source to `raw/processed/`

## Quick Start
- Open this folder in Cursor
- Keep Obsidian pointed at the same directory (optional)
- Use `templates/ingest-prompt.md` when processing a new source
- Run `scripts/lint-wiki.ps1` periodically
