# Feature Development Guide

## Goal

Use this workflow to add features in a predictable, review-friendly way.

## Workflow

1. Define scope
- User story
- API contract
- Success criteria

2. Plan implementation
- Routes/pages affected
- Components to create/update
- Services and types to update

3. Build in layers
- Add/update types first
- Implement service methods
- Build UI and wire interactions
- Add loading and error states

4. Verify
- Test core happy path
- Test invalid/empty/error cases
- Run `lint`, `type-check`, and `build`

5. Document
- Update README/docs if behavior changes

## Quality Checklist

- No duplicated API logic across pages
- Typed request/response boundaries
- Clear user feedback for failure states
- No hardcoded secrets or environment-specific assumptions
