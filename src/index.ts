import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
import { findWebhookConfig } from './config';

// Load environment variables
dotenv.config();

const app = express();

// Parse JSON bodies
app.use(express.json());

// Configuration
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const PORT = process.env.PORT || 3000;

// Discord embed interface
interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color: number;
  timestamp: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
}

// Verify GitHub webhook signature
const verifyGithubWebhook = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!GITHUB_WEBHOOK_SECRET) {
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).send('No signature provided');
  }

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const calculatedSignature = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== calculatedSignature) {
    return res.status(401).send('Invalid signature');
  }

  next();
};

// Send message to Discord webhook
const sendDiscordMessage = async (webhookUrl: string, embed: DiscordEmbed) => {
  try {
    const response = await axios.post(webhookUrl, {
      embeds: [embed],
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Discord API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
};

// GitHub webhook endpoint
app.post('/webhook', verifyGithubWebhook, async (req, res) => {
  const event = req.headers['x-github-event'] as string;
  const payload = req.body;

  // Tìm cấu hình webhook dựa trên repository
  const config = findWebhookConfig(payload.repository.full_name);
  
  if (!config) {
    console.warn(`No webhook configuration found for repository: ${payload.repository.full_name}`);
    return res.status(200).send('Repository not configured');
  }

  // Kiểm tra xem event có được đăng ký không
  if (!config.events.includes(event)) {
    console.log(`Event ${event} is not configured for repository ${payload.repository.full_name}`);
    return res.status(200).send('Event not configured');
  }

  const embed: DiscordEmbed = {
    color: 0x0099ff,
    timestamp: new Date().toISOString(),
    fields: [],
  };

  switch (event) {
    case 'push':
      embed.title = `🔨 New Push to ${payload.repository.name}`;
      embed.description = `Branch: ${payload.ref.replace('refs/heads/', '')}`;
      embed.fields = [
        { name: 'Repository', value: payload.repository.full_name },
        { name: 'Commits', value: `${payload.commits.length} new commit(s)` },
        { name: 'Author', value: payload.pusher.name },
        {
          name: 'Latest Commit Message',
          value: payload.commits[0]?.message || 'No commit message',
        }
      ];
      embed.url = payload.compare;
      break;

    case 'check_run':
      if (payload.check_run.status === 'completed') {
        const status = payload.check_run.conclusion === 'success' ? '✅' : '❌';
        embed.title = `${status} CI Check: ${payload.check_run.name}`;
        embed.description = `Repository: ${payload.repository.full_name}`;
        embed.fields = [
          { name: 'Status', value: payload.check_run.conclusion },
          { name: 'Branch', value: payload.check_run.check_suite.head_branch },
          { name: 'Commit', value: payload.check_run.head_sha.substring(0, 7) }
        ];
        embed.url = payload.check_run.html_url;
      }
      break;

    case 'pull_request':
      const action = payload.action;
      if (['opened', 'closed', 'reopened'].includes(action)) {
        embed.title = `📦 Pull Request ${action}`;
        embed.description = payload.pull_request.title;
        embed.fields = [
          { name: 'Repository', value: payload.repository.full_name },
          { name: 'Author', value: payload.pull_request.user.login },
          { name: 'Status', value: payload.pull_request.state }
        ];
        embed.url = payload.pull_request.html_url;
      }
      break;
  }

  if (embed.fields && embed.fields.length > 0) {
    await sendDiscordMessage(config.discordWebhookUrl, embed);
  }

  res.status(200).send('Webhook received');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 