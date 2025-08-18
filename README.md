# Cantina Royale Tools

A comprehensive web application for exploring and analyzing Cantina Royale NFT collections, character stats, weapons, and game data. Built with Next.js and TypeScript.

![Cantina Royale Tools](https://cantinaroyale.io/images/favicon.ico)

## 🎮 About Cantina Royale

Cantina Royale is a competitive battle royale game featuring NFT characters and weapons. This tools website provides detailed information about:
- **Character Collections**: Genesis Space Apes and Cantina Royale Heroes
- **Weapon Collections**: Arsenal X Weapons, Mythical Weapons, and Standard Weapons
- **Game Statistics**: Character skills, weapon stats, upgrade paths, and reward pools

## ✨ Features

### 🔍 NFT Explorer
- **Character Browser**: Explore all character NFTs with detailed stats and attributes
- **Weapon Browser**: Browse weapon collections with performance metrics
- **Search Functionality**: Find specific NFTs by identifier
- **Collection Filtering**: Filter by rarity, level, and other attributes

### 📊 Game Data Analytics
- **Character Skills**: Ultimate abilities, charging mechanics, and stat progressions
- **Weapon Statistics**: Damage values, ranges, and upgrade paths
- **Reward Pools**: Lootbox contents and drop rates
- **Battle Pass Data**: Season rewards and progression systems

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Powered by Framer Motion
- **Interactive Charts**: Data visualizations with Chart.js

## 🛠️ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[HeroUI](https://heroui.com/)** - Modern React UI library

### Animations & Visualization
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Chart.js](https://www.chartjs.org/)** - Data visualization
- **[React Chart.js 2](https://react-chartjs-2.js.org/)** - React wrapper for Chart.js

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Git](https://git-scm.com/)** - Version control

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VincenzoImp/cantinaroyale.tools.git
   cd cantinaroyale.tools
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
cantinaroyale.tools/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── collection/         # Collection pages
│   │   ├── nft/               # Individual NFT pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Context providers
│   └── components/            # React components
│       ├── collection/        # Collection browsers
│       ├── nft/              # NFT detail components
│       ├── footer.tsx        # Footer component
│       └── navbar.tsx        # Navigation component
├── public/
│   └── data/                  # Static data files
│       ├── CRHEROES-9edff2/   # Heroes collection
│       ├── CRWEAPONS-e5ab49/  # Weapons collection
│       ├── CRMYTH-546419/     # Mythical weapons
│       ├── GSPACEAPE-08bc2b/  # Genesis Space Apes
│       └── info.json          # App configuration
├── private/
│   └── game_data/             # Game statistics & data
│       ├── Character.Skills.Stats.csv
│       ├── RewardPool.csv
│       └── Lootboxes.Info.csv
└── package.json
```

## 🎯 Key Features in Detail

### NFT Collections Support
- **Genesis Space Apes** (`GSPACEAPE-08bc2b`) - The original Cantina Royale character collection
- **Cantina Royale Heroes** (`CRHEROES-9edff2`) - Second generation characters with unique abilities
- **Cantina Weapons** (`CRWEAPONS-e5ab49`) - Weapon NFTs with gameplay bonuses
- **Mythical Weapons** (`CRMYTH-546419`) - Rare legendary weapons with unique play modes

### Game Data Integration
- **Character Ultimate Skills**: Detailed breakdown of each character's special abilities
- **Weapon Statistics**: Damage values, ranges, and special effects
- **Upgrade Paths**: Progression systems for characters and weapons
- **Reward Systems**: Lootbox contents and probability distributions

### Dynamic Search & Filtering
- Search NFTs by exact identifier
- Filter collections by multiple criteria
- Sort by rarity, level, stats, and other attributes
- Real-time results with responsive UI

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```bash
# Example environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=https://api.multiversx.com
```

### Data Sources
- NFT metadata is stored in `public/data/` directory
- Game statistics are in `private/game_data/` directory
- Configuration is managed through `public/data/info.json`

## 🤝 Contributing

We welcome contributions to improve Cantina Royale Tools!

### Development Guidelines
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration provided
- Maintain consistent formatting with Prettier
- Write descriptive commit messages

## 📊 Data Structure

### NFT Collections
Each collection follows a standardized structure:
```json
{
  "collection": "COLLECTION-ID",
  "name": "Collection Name",
  "ticker": "TICKER",
  "holderCount": 142,
  "nftCount": 3028,
  "assets": {
    "website": "https://cantinaroyale.io",
    "description": "Collection description"
  }
}
```

### Character Skills
Character abilities are defined with level-based progression:
```csv
Character,Skill,Level1,Level2,...,Level10,Scaling
FreeCharacter3,ultimateskill_charging_duration,90,90,...,90,1.0
FreeCharacter3,ultimateskill_9lives_healthPercentage,25,30,...,80,1.0
```

## 🚀 Deployment

### Vercel (Recommended)
This project is optimized for deployment on [Vercel](https://vercel.com/):

1. **Connect** your GitHub repository to Vercel
2. **Configure** build settings (auto-detected for Next.js)
3. **Deploy** with automatic CI/CD

### Alternative Platforms
- **Netlify**: Compatible with static export
- **Railway**: Node.js hosting
- **Digital Ocean**: VPS deployment

## 🔗 Links

- **Website**: [cantinaroyale.tools](https://cantinaroyale.tools)
- **Game**: [cantinaroyale.io](https://cantinaroyale.io)
- **GitHub**: [VincenzoImp/cantinaroyale.tools](https://github.com/VincenzoImp/cantinaroyale.tools)
- **MultiversX Explorer**: [explorer.multiversx.com](https://explorer.multiversx.com)

### Social Media
- **Twitter**: [@CantinaRoyale](https://twitter.com/CantinaRoyale)
- **Discord**: [discord.gg/cantinaroyale](https://discord.gg/cantinaroyale)
- **Telegram**: [t.me/CantinaRoyale](https://t.me/CantinaRoyale)
- **Blog**: [blog.cantinaroyale.io](https://blog.cantinaroyale.io)

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for the Cantina Royale community**
