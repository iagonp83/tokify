# Project Context — Design System Compiler (Tokify)

## Product Vision

Build a design system compiler: a tool that generates full reusable design systems and components from a brand configuration.

This is NOT a Webflow clone or page builder.

A separate future project may explore a visual CMS/Sanity-like builder, but this repo is focused only on the design system/component generator.

---

## Architecture Reference

See:
docs/architecture/design-system-compiler-v2.md

This document defines the formal system architecture and must be treated as the source of truth for structural decisions.

---

## Core Flow

Brand input + token configuration
→ design system tokens, profiles and overrides
→ library-agnostic component model
→ library adapter (shadcn / Radix / CSS-only)
→ component generation
→ component composition
→ export to code / Figma

---

## Current Stack

React + TypeScript + Vite

---

## Current Capabilities

- Design profiles: minimal, expressive, dense
- Global tokens: color, layout, motion
- Component-level tokens: card, toolbar, panel
- Component overrides persist across profile/motion changes
- Motion presets are real token groups
- Custom presets stored in localStorage
- Export tokens to CSS
- Export tokens to JSON
- Import tokens from JSON
- File-based export/download

---

## Core Principles

- Tokens are the source of truth
- Components are generated from tokens
- Components must remain editable after generation
- Component model must be library-agnostic
- Libraries are adapters, not the core system
- Motion is first-class, not decorative
- CSS variables are the runtime contract
- JSON tokens must be reusable externally
- Component-level tokens remain independent
- Profile changes must not destroy overrides
- Reset actions must be explicit

---

## Architecture Layers

1. Token Engine (existing)
2. Component Model (current focus)
3. Variant System
4. Library Adapter Layer
5. Component Generator
6. Composer (component composition)
7. AI-Assisted Operations Layer
8. Compiler Core (future)
9. Export Layer

---

## AI-Assisted Operations Layer

### Overview

The AI layer acts as an assistive operational system, not as a generative source of truth.

It translates user intent into structured operations executed by the compiler.

AI must NOT generate:

- raw CSS
- JSX/component code
- unvalidated token values

All outputs must be structured operations.

---

### Design Operations Model

Example:

{
  "type": "token.adjust_contrast",
  "target": {
    "type": "component",
    "name": "Button",
    "state": "hover"
  },
  "parameters": {
    "level": "AA",
    "preserveHue": true
  }
}

Operations are resolved by deterministic handlers.

Targets must exist or explicitly trigger creation operations.

---

### Operation Categories

Tokens:
- update_token
- generate_scale
- apply_palette_preset
- adjust_contrast

Components:
- modify_component_density
- update_spacing
- create_variant
- apply_variant
- override_token

Motion:
- apply_motion_preset
- reduce_motion
- tune_microinteraction

Accessibility:
- explain_wcag_issue
- fix_wcag_violation
- propose_accessible_alternative

---

### Compiler Enforcement Pipeline

1. Schema validation
2. Token constraints validation
3. Component rules validation
4. Accessibility validation
5. Preview rendering (canvas)
6. User confirmation (optional)
7. Apply changes
8. Export pipeline

---

### Critical Rule

No AI-generated output may be applied directly.

All operations MUST pass through the compiler.

---

### Role of AI

AI enhances:

- speed
- usability
- suggestions

AI does NOT replace:

- token system
- component architecture
- compiler logic
- validation rules

---

## Target Libraries

- shadcn/ui
- Radix UI
- CSS-only

---

## Target Exports

- React components
- shadcn-compatible code
- Radix wrappers
- CSS-only components
- CSS variables
- JSON tokens
- Figma / Tokens Studio output

---

## Next Steps

1. Define Component Model
2. Define Variant System
3. Build Button component (reference implementation)
4. Introduce adapter abstraction
5. Formalize token graph