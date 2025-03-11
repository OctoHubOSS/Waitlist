# OctoSearch - GitHub Repository Search Tool

OctoSearch is a modern web application that allows users to search and explore GitHub repositories efficiently using GitHub's API.

## Features

- Search GitHub repositories by name, language, and more
- Filter results by various criteria
- View detailed repository information
- Responsive design for mobile and desktop

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- GitHub REST API

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
```

## Getting Started with github-search

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
