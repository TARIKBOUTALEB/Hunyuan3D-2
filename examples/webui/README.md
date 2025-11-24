# Web UI Demo

This folder contains a standalone React `App.tsx` that demonstrates a multi-step pipeline UI for orchestrating Hunyuan3D multiview generation with Google Gemini image models.

The component set is intentionally minimal:
- `App.tsx` orchestrates the workflow and mock pipeline transitions.
- `components/` includes simple layout primitives used by the app.
- `constants.ts` holds example entries that read preview images from `assets/example_images/` in this repository.

## How to try it
1. Create a new Vite + React + TypeScript project (or reuse an existing one).
2. Copy the files from `examples/webui/` into your project `src/` directory.
3. Install dependencies:
   ```bash
   npm install react react-dom lucide-react @google/genai
   ```
4. Expose your Google API key as `VITE_API_KEY` (for Vite) or `API_KEY` (for Node/Next) in the dev server environment (for example with a `.env` file). If no key is present the demo will fall back to echoing the uploaded image instead of calling Gemini so the UI can still be exercised.
5. Ensure the paths in `constants.ts` resolve to accessible images (you can leave the defaults if you copy the `assets/example_images` folder into your public directory).

The UI mocks the pipeline progress while the Gemini request is running so it stays responsive even when remote inference is slow.
