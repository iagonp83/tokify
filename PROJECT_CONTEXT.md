# Project Context — Design System Generator

## Goal
Build a design system generator, not a Webflow clone.

The tool should generate reusable design systems and components that can later be exported to other platforms/codebases.

A separate future project may explore a visual CMS/Sanity-like builder, but this repo is focused on the design system/component generator.

## Current Architecture
The app is a React + TypeScript + Vite project.

Current capabilities:
- Design profiles: minimal, expressive, dense
- Global design tokens:
  - color
  - layout
  - motion
- Component-level tokens for:
  - card
  - toolbar
  - panel
- Component overrides are preserved when changing profile or motion preset
- Motion presets exist as real token groups, not just speed multipliers
- Custom presets can be saved to localStorage
- Export tokens to CSS
- Export tokens to JSON
- Import tokens from JSON
- Export/download works with real files

## Important Product Principles
- This is a design system engine, not a page builder.
- CSS variables are the runtime contract.
- JSON tokens should be usable by external tooling later.
- Component-level tokens must remain independent.
- Changing profiles should update global defaults but must not destroy component overrides.
- Reset actions should be explicit.

## Git Status
Repo is initialized, committed, and pushed to GitHub.
Work should continue with small commits after each stable feature.

## Next Recommended Steps
1. Add “Reset component” button:
   - resets only active component overrides
   - does not reset global profile
2. Improve JSON token schema:
   - consider numeric values + units metadata
3. Add component-specific export clarity:
   - :root for globals
   - [data-component="card"]
   - [data-component="toolbar"]
   - [data-component="panel"]
4. Later:
   - add Button/Input components
   - add code generation
   - add Figma-oriented export