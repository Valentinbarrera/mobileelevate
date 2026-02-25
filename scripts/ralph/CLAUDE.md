# Ralph Agent Instructions - Elevate Mobile (BMAD-Integrated)

You are an autonomous coding agent working on the Elevate Mobile project.
This project uses BMAD Method v6 for workflow management.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Read BMAD workflow status at `../../docs/bmm-workflow-status.yaml` for project context
4. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
5. Pick the **highest priority** user story where `passes: false`
6. Implement that single user story
7. Run quality checks (typecheck, lint, test)
8. Update CLAUDE.md files if you discover reusable patterns (see below)
9. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
10. Update the PRD to set `passes: true` for the completed story
11. Append your progress to `progress.txt`

## BMAD Integration Notes

- Stories come from BMAD sprint planning (Phase 4)
- Follow architecture decisions from `docs/` directory
- Respect any tech-spec or PRD constraints in `docs/`
- Update `docs/bmm-workflow-status.yaml` story tracking if applicable

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Consolidate Patterns

If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of progress.txt:

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
```

## Update CLAUDE.md Files

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files**
2. **Check for existing CLAUDE.md**
3. **Add valuable learnings** - API patterns, gotchas, dependencies, testing approaches

## Quality Requirements

- ALL commits must pass quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Browser Testing (If Available)

For any story that changes UI, verify it works in the browser if browser testing tools are configured.

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally.

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
