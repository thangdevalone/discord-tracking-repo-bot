# GitHub to Discord Notification Bot

A Node.js server that listens for GitHub webhook events and sends notifications to multiple Discord channels. Get notified when:
- New commits are pushed
- CI/CD checks complete
- Pull requests are opened, closed, or reopened

## Features

- 🔨 Push notifications with commit details
- ✅ CI/CD status updates
- 📦 Pull request activity tracking
- 🔐 Secure webhook verification
- 💬 Beautiful Discord embeds
- 🔄 Support multiple repositories and Discord channels
- ⚙️ Configurable events per repository

## Prerequisites

- Node.js (v14 or higher)
- Discord webhook URLs for each channel
- GitHub repositories with webhook access

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discord-tracking-repo-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory with the following content:
   ```env
   # GitHub Webhook Secret (optional but recommended)
   GITHUB_WEBHOOK_SECRET=your_webhook_secret_here

   # Repository 1 Configuration
   GITHUB_REPO_1=owner/repo1
   DISCORD_WEBHOOK_1=discord_webhook_url_for_repo1
   GITHUB_EVENTS_1=push,check_run,pull_request

   # Repository 2 Configuration
   GITHUB_REPO_2=owner/repo2
   DISCORD_WEBHOOK_2=discord_webhook_url_for_repo2
   GITHUB_EVENTS_2=push,pull_request

   # Add more repositories as needed...
   # GITHUB_REPO_3=owner/repo3
   # DISCORD_WEBHOOK_3=discord_webhook_url_for_repo3
   # GITHUB_EVENTS_3=push,check_run

   # Server Configuration
   PORT=3000
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Discord Webhook Setup

For each Discord channel you want to receive notifications:

1. Go to your Discord server
2. Right-click on the channel
3. Select "Edit Channel"
4. Click on "Integrations"
5. Click on "Create Webhook"
6. Give your webhook a name and (optionally) set an avatar
7. Click "Copy Webhook URL"
8. Add the webhook URL to your `.env` file as `DISCORD_WEBHOOK_X` (where X is the repository number)

## GitHub Webhook Setup

For each GitHub repository:

1. Go to your repository settings
2. Navigate to Webhooks > Add webhook
3. Set Payload URL to `http://your-server:3000/webhook`
4. Set Content type to `application/json`
5. Set the same secret for all repositories (add to `.env` as `GITHUB_WEBHOOK_SECRET`)
6. Select the events you want to receive (should match the events in your `.env` configuration)

## Environment Variables

- `GITHUB_WEBHOOK_SECRET`: Secret key for verifying GitHub webhooks
- `GITHUB_REPO_X`: Full repository name (owner/repo) for repository X
- `DISCORD_WEBHOOK_X`: Discord webhook URL for repository X
- `GITHUB_EVENTS_X`: Comma-separated list of GitHub events to handle for repository X
- `PORT`: Server port (default: 3000)

## Supported Events

- `push`: New commits pushed to repository
- `check_run`: CI/CD check results
- `pull_request`: Pull request activities

## Available Scripts

- `npm run build` - Build the TypeScript code
- `npm start` - Start the production server
- `npm run dev` - Start the development server with ts-node
- `npm run watch` - Watch for file changes and rebuild

## Security

- The webhook endpoint verifies GitHub signatures if a secret is configured
- Environment variables are used for sensitive data
- No sensitive data is logged or stored

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

ISC 