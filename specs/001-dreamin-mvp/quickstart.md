# Quickstart & Verification Guide

**Feature**: DreamIn MVP

## Prerequisites
1. **Rust**: Installed (v1.75+).
2. **Node.js**: Installed (v18+).
3. **Pnpm**: Installed (`npm i -g pnpm`).
4. **Tauri CLI**: Installed (`cargo install tauri-cli`).

## Setup

1. **Install Frontend Dependencies**:
   ```bash
   pnpm install
   ```

2. **Initialize Tauri**:
   *(If not already initialized)*
   ```bash
   pnpm tauri init
   ```

3. **Run Development Mode**:
   ```bash
   pnpm tauri dev
   ```

## Verification Scenarios

### 1. Configure API
1. Open Settings (gear icon).
2. Enter a valid API Token (e.g., OpenAI Key or mock).
3. Save.
4. **Verify**: Check console logs (if debug) or try generating. Token should persist after restart.

### 2. Generate Image (Text-to-Image)
1. Go to "Creative Studio".
2. Enter prompt: "A cyberpunk cat".
3. Click "Generate".
4. **Verify**:
   - Loading spinner appears.
   - Image appears in the view area.
   - File is created in `~/Documents/DreamIn/Outputs/`.

### 3. Create & Use Resource
1. **Create**:
   - Go to "Resource Library".
   - Click "New Resource".
   - Upload an image (e.g., a sketch).
   - Enter prompt: "Sketch style".
   - Save as "My Sketch".
2. **Load**:
   - Go to "Creative Studio".
   - Click "Load Resource" -> Select "My Sketch".
   - **Verify**: Prompt input shows "Sketch style" and Image Upload area shows the sketch image.
3. **Generate**:
   - Click "Generate".
   - **Verify**: API receives both prompt and image (Img2Img).

### 4. View Gallery
1. Go to "Assets Gallery".
2. **Verify**: You see the images generated in steps 2 and 3.
3. Click an image.
4. **Verify**: System image viewer opens the file.
