# ASH IT Consulting

A responsive enterprise consulting website for ASH IT Consulting Inc., focused on AI systems, Microsoft automation, cloud modernization, data intelligence, and public-sector delivery.

## Local preview

```sh
python3 -m http.server 4173 --directory dist
```

Then open `http://127.0.0.1:4173`.

## Contact flow

The inquiry form validates required fields and opens a pre-addressed email draft to `info@ashitconsulting.ca`; no submitted form data is stored by the static site.

## Homepage sequence

The homepage hero is a scroll-scrubbed canvas sequence (`dist/assets/sequence.js`): fragmented signals → AI reads and classifies → policy routes → a governed dashboard. Each frame is drawn from scroll progress, so there are no video or frame images to download. All narrative copy is static HTML. With `prefers-reduced-motion` (or without JavaScript) the page shows the copy alongside a still of the final dashboard.
