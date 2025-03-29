# OctoHub Waitlist
A simple, efficient waitlist system for the upcoming OctoHub platform - the next generation of code collaboration.

## Overview
This repository contains the waitlist and coming-soon page for OctoHub. It allows users to sign up to receive updates and early access when the full platform launches.

## Features
- Email collection with validation
- Status tracking for subscribers
- Source attribution for analytics
- Responsive design for all devices
- Dark theme UI optimized for developers


## Tech Stack
- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js with Next.js API routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: Built-in email verification


## Development
- Prerequisites
  - Node.js (v16+)
  - npm or yarn
  - MySQL database

## Setup

### 1. Clone the Repository: 
```bash
$ git clone  https://OctoHubOSS/Waitlist.git
$ cd octohub-waitlist
```

### 2. Install Dependencies:
```bash
$ [bun|yarn|npm] install
```

### 3. Environment Variables:
- Copy `.env.example` to `.env.local` and configure the variables:
```bash
$ cp .env.example .env.local
```

### 4. Start the Development Server
```bash
$ [bun|yarn|npm] run dev
```

> You can view the local website at `http://localhost:3000`