# ASH IT Consulting

A responsive website for ASH IT Consulting Inc., a Canadian Microsoft data and agentic AI consulting firm: Microsoft Fabric data engineering, secure AI agents with Copilot and Azure AI Foundry, actionable automation, and SaaS delivery with forward deployed engineers.

## Local preview

```sh
python3 -m http.server 4173 --directory dist
```

Then open `http://127.0.0.1:4173`.

## Contact flow

The inquiry form validates required fields and opens a pre-addressed email draft to `info@ashitconsulting.ca`; no submitted form data is stored by the static site.

## Homepage sequence

The homepage hero is a scroll-scrubbed canvas sequence (`dist/assets/sequence.js`) that walks the reference architecture: data sources → Microsoft Fabric (bronze, silver, gold) → Agents & AI (Azure AI Foundry, Copilot Studio) → Microsoft Teams, with a security and governance strip underneath. Each frame is drawn from scroll progress, so there are no video or frame images to download. All narrative copy is static HTML. `dist/assets/motion.js` adds site-wide smooth scrolling (vendored Lenis, MIT), masked headline reveals, scroll-linked section transitions, parallax, and magnetic buttons. With `prefers-reduced-motion` (or without JavaScript) the page shows the copy alongside a still of the final dashboard.
