# Project Context — Design System Generator

## Product Vision

Build a design system compiler: a tool that generates full reusable design systems and components from a brand configuration.

This is not a Webflow clone or page builder.

A separate future project may explore a visual CMS/Sanity-like builder, but this repo is focused only on the design system/component generator.

## Core Flow

Brand input + token configuration
→ design system tokens, profiles and overrides
→ library-agnostic component model
→ library adapter: shadcn / Radix / CSS-only
→ component generation
→ component composition
→ export to code / Figma

## Current Stack

React + TypeScript + Vite.

## Current Capabilities

- Design profiles: minimal, expressive, dense
- Global tokens: color, layout, motion
- Component-level tokens: card, toolbar, panel
- Component overrides are preserved when changing profile or motion preset
- Motion presets exist as real token groups, not just speed multipliers
- Custom presets persist in localStorage
- Export tokens to CSS
- Export tokens to JSON
- Import tokens from JSON
- Export/download works with real files

## Core Principles

- Tokens are the source of truth.
- Components are generated from tokens.
- Components must be editable after generation.
- Component model must be independent from UI libraries.
- Libraries are adapters, not the core system.
- Motion is part of the system, not decoration.
- CSS variables are the runtime contract.
- JSON tokens should be usable by external tooling later.
- Component-level tokens must remain independent.
- Changing profiles should update global defaults but must not destroy component overrides.
- Reset actions should be explicit.

## Architecture Layers

1. Token Engine — already implemented
2. Component Model — next major step
3. Library Adapter layer
4. Component Generator
5. Composer — combine existing components into new ones
6. Export layer

## Target Libraries

The system must support multiple base libraries:

- shadcn/ui
- Radix UI
- CSS-only

Each library behaves differently and requires an adapter layer.

## Target Exports

- React components
- shadcn-compatible code
- Radix-based wrappers
- CSS-only components
- CSS variables
- JSON tokens
- Figma / Tokens Studio compatible output

## Git Status

Repo is initialized, committed, and pushed to GitHub.

Work should continue with small commits after each stable feature.

## Next Recommended Steps

1. Commit this context document.
2. Add “Reset component”:
   - resets only active component overrides
   - does not reset global profile
3. Improve JSON token schema:
   - numeric values
   - explicit units metadata
4. Define a library-agnostic Component Model.
5. Add first real generated components:
   - Button
   - Input
   - Card
6. Introduce Library Adapter abstraction.