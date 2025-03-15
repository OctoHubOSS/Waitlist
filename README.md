# OctoSearch - GitHub Repository Search Tool

OctoSearch is a modern web application that allows users to search and explore GitHub repositories efficiently using GitHub's API. Browse repositories, view code, and discover new projects with an elegant, GitHub-inspired interface.

## Features

- Search and explore GitHub repositories by name, language, stars, and more
- Browse repository files with a dual-mode file explorer (Standard & Modern views)
- View file contents with syntax highlighting and multiple theme options
- Display repository statistics including stars, forks, watchers, and issues
- View repository metadata including license, size, and language breakdown
- Responsive design optimized for both mobile and desktop
- Markdown rendering for README files and documentation
- Repository changelogs with commit history

## Tech Stack

- **Next.js Canary** - React framework with server components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations and transitions
- **GitHub REST API** - Repository data source
- **SWR** - Data fetching and caching
- **React Syntax Highlighter** - Code highlighting with multiple themes
- **React Markdown** - Markdown rendering with remark/rehype plugins

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Git-Logs/octosearch.git
cd octosearch
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```
GITHUB_API_TOKEN=your_github_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Key Features Usage

- **Repository Search**: Use the search bar to find repositories by name or topic
- **File Explorer**: Switch between Standard and Modern views using the toggle button
- **Syntax Highlighting**: Change code themes in the Modern view using the settings dropdown
- **Browse Code**: Navigate through directories, view files, and download content

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write clean, readable, and maintainable code
- Update tests and documentation as needed
- Use TypeScript types for all new components and functions

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0). See the [LICENSE](./LICENSE) file for more details.

The AGPL-3.0 license ensures that modifications to the code must be made available to users interacting with the software over a network. This promotes open source contributions and transparency.
