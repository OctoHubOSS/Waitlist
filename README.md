# OctoHub

OctoHub is a powerful, feature-rich code hosting and collaboration platform designed to enhance software development workflows. Built as a modern alternative to traditional version control platforms, OctoHub provides advanced tools for developers, teams, and organizations.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Setup](#environment-setup)
  - [Environment Variables Reference](#environment-variables-reference)
- [Tech Stack](#tech-stack)
- [Data Model](#data-model)
- [Email System](#email-system)
- [Development](#development)
  - [Commands](#commands)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Comprehensive Repository Management**: Host, manage, and collaborate on Git repositories with advanced controls
- **Enhanced Pull Request Workflow**: Streamlined code review process with powerful automation options
- **Advanced Issue Tracking**: Sophisticated issue management with custom fields and automation
- **Organization Management**: Enterprise-ready team and permission management system
- **Package Registry**: Integrated package hosting for multiple package formats
- **Email Notifications**: Customizable notification system with responsive templates
- **Workflow Automation**: Built-in CI/CD capabilities and customizable workflow triggers
- **Analytics Dashboard**: Detailed insights into repository activity and team performance

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-organization/octohub-web.git
   cd octohub-web
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   ```bash
   cp example.env .env.local
   ```
   Fill in your environment variables in `.env.local` (see Environment Setup below)

4. Run database migrations
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Setup

OctoHub requires several environment variables to be set for different features to function correctly. Copy the example environment file and customize it for your setup:

```bash
cp example.env .env.local
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|:--------:|:-------:|
| **Application Settings** |
| `NEXT_PUBLIC_APP_URL` | Public URL where your application is hosted | Yes | - |
| **Database** |
| `DATABASE_URL` | MySQL connection string | Yes | - |
| **Authentication** |
| `NEXTAUTH_URL` | URL for NextAuth.js authentication | Yes | - |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes | - |
| `NEXTAUTH_JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Yes* | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | Yes* | - |
| **GitHub Integration** |
| `GITHUB_TOKEN` | GitHub personal access token | No | - |
| `GITHUB_API_URL` | GitHub API URL | No | `https://api.github.com/` |
| **Email Settings** |
| `DEFAULT_FROM_EMAIL` | Default sender email address | Yes* | - |
| `DEFAULT_FROM_NAME` | Default sender name | No | `OctoHub` |
| **Azure (for Email)** |
| `AZURE_APP_CLIENT_ID` | Azure app registration client ID | Yes* | - |
| `AZURE_APP_CLIENT_SECRET` | Azure app registration client secret | Yes* | - |
| `AZURE_APP_TENANT_ID` | Azure app registration tenant ID | Yes* | - |

\* Required for specific functionality

## Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Email**: React Email
- **Authentication**: NextAuth.js with custom providers
- **API**: RESTful API with optional GraphQL support
- **Email Service**: Microsoft Graph API

## Data Model

OctoHub features a comprehensive data model that supports all platform features including:

- Users and authentication
- Organizations and teams
- Repositories with fine-grained permissions
- Issues, pull requests, and code reviews
- Packages and releases
- Audit logs and activity tracking
- Analytics and trending data

## Email System

OctoHub includes a custom email system built with React Email components and Microsoft Graph API for delivery. The system supports:

- Responsive email templates
- Dark/light mode themes
- Customizable layouts
- TypeScript integration

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run test` - Run tests
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:e2e` - Run end-to-end tests
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma database UI
- `npm run db:seed` - Seed database with test data
- `npm run db:reset` - Reset database for development

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.

This license requires that:
- Source code must be made available when the software is distributed
- Modifications must be released under the same license
- Network use is distribution
- License and copyright notices must be preserved

## Acknowledgments
- All the contributors who have helped and continue to help shape OctoHub
- The open source community for inspiration and tools
- React Email for the email templating system
- Next.js team for the incredible framework
- Microsoft for Graph API
