interface WebhookConfig {
  repositoryName: string;  // Tên repository trên GitHub (format: owner/repo)
  discordWebhookUrl: string;  // Discord webhook URL cho repository này
  events: string[];  // Các events muốn nhận thông báo
}

// Đọc cấu hình từ environment variables
const loadWebhookConfigs = (): WebhookConfig[] => {
  const configs: WebhookConfig[] = [];
  let index = 1;

  while (true) {
    const repoName = process.env[`GITHUB_REPO_${index}`];
    const webhookUrl = process.env[`DISCORD_WEBHOOK_${index}`];
    const events = process.env[`GITHUB_EVENTS_${index}`];

    if (!repoName || !webhookUrl) {
      break;
    }

    configs.push({
      repositoryName: repoName,
      discordWebhookUrl: webhookUrl,
      events: events ? events.split(',').map(e => e.trim()) : ['push', 'check_run', 'pull_request']
    });

    index++;
  }

  return configs;
};

export const webhookConfigs = loadWebhookConfigs();

// Hàm helper để tìm cấu hình webhook dựa trên tên repository
export const findWebhookConfig = (repositoryFullName: string): WebhookConfig | undefined => {
  return webhookConfigs.find(config => config.repositoryName === repositoryFullName);
}; 