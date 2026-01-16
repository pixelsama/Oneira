# Oneiria

Oneiria is a modern, local-first AI creative studio application built with Tauri v2. It provides a seamless interface for generating, managing, and organizing AI-generated artwork, focusing on privacy, performance, and user experience.

![License](https://img.shields.io/github/license/pixelsama/Oneira)
![Tauri](https://img.shields.io/badge/Tauri-v2-orange)
![React](https://img.shields.io/badge/React-v19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue)

## ✨ key Features

-   **🎨 Creative Studio**: A powerful interface for AI image generation. currently supports:
    -   **Multi-Model Support**: Seamlessly switch between Volcengine Doubao (Seedream) and OpenAI (DALL-E).
    -   **Custom Resolution**: Dynamic resolution options based on the selected provider (including 2K/4K support for Doubao).
    -   **Prompt Management**: Optimized prompt input experience.

-   **🖼️ Assets Gallery**:
    -   Local-first image storage and management.
    -   Grid view for easy browsing of generated assets.

-   **📚 Resource Library**:
    -   Organize and manage your creative resources and presets.

-   **⚙️ Flexible Configuration**:
    -   Secure API key management (stored locally).
    -   Customizable generation settings.

## 🛠️ Tech Stack

-   **Core**: [Tauri v2](https://v2.tauri.app/) (Rust + WebView)
-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: TailwindCSS 4
-   **State Management**: Zustand
-   **Routing**: React Router v7
-   **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js** (v20 or later recommended)
-   **Rust** (Latest stable version) -> [Install Rust](https://www.rust-lang.org/tools/install)
-   **pnpm** (Recommended package manager)

### Installation

1.  **Clone the repository**
    ```bash
    git clone git@github.com:pixelsama/Oneira.git
    cd Oneira
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Run the development environment**
    ```bash
    pnpm tauri dev
    # or
    npm run tauri dev
    ```

    The application window should launch shortly.

## 📦 Building for Production

To create a release build for your operating system:

```bash
pnpm tauri build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
