<div align="center">

# 🤖 MemeOClock

<img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge&logo=statuspage&logoColor=white" alt="Status" />
&nbsp;
<img src="https://img.shields.io/badge/bun-v1.0+-black?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
&nbsp;
<img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
&nbsp;
<img src="https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord" />
&nbsp;
<img src="https://img.shields.io/badge/Reddit-Powered-FF4500?style=for-the-badge&logo=reddit&logoColor=white" alt="Reddit" />
&nbsp;
<img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="License" />


<br/>

> **A lightweight Discord bot that delivers a fresh meme to your server every single day - no fluff, just dopamine. 🧠**

<br/>

### 📸 Preview

<img src="https://i.imgur.com/TYiGMUI.png" alt="MemeOClock Preview" width="660" />

<br/>

---

</div>

## ✨ Features

### 🟢 Live
| Feature | Description |
|---|---|
| 📅 **Daily Memes** | Automatically delivers a fresh meme every day - right on schedule |
| 📦 **Reddit-Powered** | Pulls trending memes straight from Reddit's best communities |
| ⚡ **Blazing Fast** | Built on [Bun](https://bun.sh/) - the fastest JS runtime available |
| 💬 **Clean & Quiet** | Minimal, non-intrusive bot behavior - no spam, no noise |
| 🛠️ **Easy Setup** | Up and running in minutes with a single `.env` configuration |
| 🔒 **Type-Safe** | Full TypeScript support for maintainable, reliable code |
| 👍 **Reactions** | Every meme post gets automatic 👍 👎 buttons for instant crowd voting |

### 🚧 In Development
| Feature | Description |
|---|---|
| 🕐 **`/schedule`** | Admins can set the exact time the daily meme drops (e.g. `9:00 AM`) per server |
| 🎯 **Subreddit Picker** | Choose which subreddits to pull from - r/memes, r/dankmemes, r/me_irl, and more |
| 📆 **Meme of the Week** | Every weekend, the bot crowns the most-reacted meme from the past 7 days |
| 🏆 **Leaderboard** | Tracks weekly and all-time top memes ranked by server reactions |
| 🥇 **`/topmeme`** | Instantly surface the highest-rated meme ever posted in the server |
| 🚫 **Duplicate Detection** | Tracks previously posted memes and skips any repeats automatically |
| 📺 **Multi-Channel Support** | Configure multiple channels with independent subreddits and schedules |

<br/>

---

## 📋 Requirements

Before getting started, make sure you have the following:

- **[Bun](https://bun.sh/) v1.0+** - the runtime this project is built on
- **[Discord Bot Token](https://discord.com/developers/applications)** - from the Discord Developer Portal

<br/>

---

## 🚀 Installation

**1. Clone the repository**

```bash
git clone https://github.com/ViB404/memeOclock.git
cd memeOclock
```

**2. Install dependencies**

```bash
bun install
```

<br/>

---

## ⚙️ Configuration

**1. Copy the example environment file**

```bash
cp .env.example .env
```

**2. Fill in your `.env` file**

```env
DISCORD_BOT_TOKEN=your_bot_token_here
GUILD_ID=your_main_guild_id
PROD=true
DISCORD_INFO_WEBHOOK=your_webhook_url_here
OWNER_ID=your_discord_user_id
DEV_GUILD_ID=your_dev_server_id
```

**3. Environment variable reference**

| Variable | Required | Description |
|---|:---:|---|
| `DISCORD_BOT_TOKEN` | ✅ | Your Discord bot token from the [Developer Portal](https://discord.com/developers/applications) |
| `GUILD_ID` | ⏳ | Main server (guild) ID - reserved for future use |
| `PROD` | ⏳ | Production mode flag - reserved for future use |
| `DISCORD_INFO_WEBHOOK` | ✅ | Webhook URL used to send notifications when key bot events occur |
| `OWNER_ID` | ✅ | Your Discord user ID - grants access to owner-only commands |
| `DEV_GUILD_ID` | ✅ | Dev server ID - owner commands are registered here instead of globally |

> [!NOTE]
> Variables marked ⏳ are **reserved for future features** and have no effect right now. You can leave them blank or set placeholder values.

> [!WARNING]
> **Never share or commit your `DISCORD_BOT_TOKEN`.** Treat it like a password - if exposed, regenerate it immediately in the Discord Developer Portal.

<br/>

---

## ▶️ Usage

Start the bot with a single command:

```bash
bun run src/index.ts
```

Once running, **MemeOClock** will automatically post a fresh meme every day in your configured Discord channel. That's it. Sit back and let the memes roll in. 🎉

<br/>

---

## 📸 Meme Source

Memes are fetched via the community-built **[Meme API](https://github.com/D3vd/Meme_Api)** by [@D3vd](https://github.com/D3vd).

> Huge thanks to D3vd for maintaining this fantastic open-source API ❤️

<br/>

---

## 🛠 Tech Stack

<div align="center">

| Technology | Role |
|---|---|
| [**Bun**](https://bun.sh/) | Fast all-in-one JavaScript runtime & package manager |
| [**TypeScript**](https://www.typescriptlang.org/) | Type-safe JavaScript for reliable, maintainable code |
| [**Discord API**](https://discord.com/developers/docs/) | Bot interaction, messaging, and channel management |
| [**Meme API**](https://github.com/D3vd/Meme_Api) | Reddit meme fetching and delivery |

</div>

<br/>

---

## 🤝 Contributing

Contributions are always welcome! Here's how to get involved:

**1. Fork the repository**

**2. Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

**3. Commit your changes**
```bash
git commit -m "feat: add amazing feature"
```

**4. Push to GitHub**
```bash
git push origin feature/amazing-feature
```

**5. Open a Pull Request** and describe what you've built 🙌

<br/>

---

## 📄 License

This project is licensed under the **MIT License**.
See the [LICENSE](https://github.com/ViB404/memeOclock/blob/main/LICENSE) file for full details.

<br/>

---

<div align="center">

Made with ❤️ for Discord servers that run on memes and caffeine ☕😎

<br/>

<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/maintained-yes-blue?style=flat-square" />
<img src="https://img.shields.io/badge/powered%20by-bun-black?style=flat-square&logo=bun" />

</div>
