# GitHub Stats API

A serverless API to generate dynamic GitHub stats cards for your README.

> **Deploy your own instance on Vercel for free!**

## 🚀 Deployment

1.  **Fork** this repository.
2.  **Import** the project to [Vercel](https://vercel.com).
3.  **Environment Variables**:
    *   `GITHUB_TOKEN`: Your GitHub Personal Access Token (optional, but recommended to avoid rate limits).

---

## 📊 Available Cards

### 1. GitHub Stats Card

Displays total stars, commits, PRs, issues, and your rank.

**Endpoint:** `/api/stats`

#### Usage

```markdown
![GitHub Stats](https://ajit421.vercel.app/api/stats?username=YOUR_USERNAME&theme=tokyonight&hide_border=true&show_icons=true)
```

#### Parameters

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required**. Your GitHub username. | - |
| `hide_rank` | Hides the rank circle. | `false` |
| `show_icons` | Toggles icons. | `true` |
| `hide_border` | Hides the card border. | `false` |
| `custom_title` | Custom text for the card title. | `[Name]'s GitHub Stats` |
| `theme` | Color theme (see below). | `default` |

---

### 2. Top Languages Card

Displays your most used languages.

**Endpoint:** `/api/top-langs`

#### Usage

```markdown
![Top Languages](https://ajit421.vercel.app/api/top-langs?username=YOUR_USERNAME&layout=pie&theme=tokyonight&hide_border=true)
```

#### Parameters

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required**. Your GitHub username. | - |
| `layout` | Layout style: `normal`, `pie`, `compact` | `normal` |
| `hide_border` | Hides the card border. | `false` |
| `theme` | Color theme. | `default` |

---

### 3. Streak Stats Card

Displays your current and longest commit streak.

**Endpoint:** `/api/streak`

#### Usage

```markdown
![GitHub Streak](https://ajit421.vercel.app/api/streak?username=YOUR_USERNAME&theme=tokyonight&hide_border=true)
```

#### Parameters

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `username` | **Required**. Your GitHub username. | - |
| `hide_border` | Hides the card border. | `false` |
| `theme` | Color theme. | `default` |

---

## 🎨 Customization

### Themes

Available built-in themes:
- `default`
- `dark`
- `tokyonight`
- `radical`

### Custom Colors

You can customize specific colors by passing hex codes (without `#`):

- `bg_color`: Background color
- `text_color`: Text color
- `title_color`: Title color
- `icon_color`: Icon color
- `border_color`: Border color

#### Example: Custom Dark Theme

```markdown
![Custom Stats](https://ajit421.vercel.app/api/stats?username=ajit421&bg_color=0d1117&text_color=58a6ff&title_color=58a6ff&icon_color=58a6ff&hide_border=true)
```

---

## ⚡ Examples

### Hide Rank
<img src="https://ajit421.vercel.app/api/stats?username=ajit421&hide_rank=true" height="150" />

### Hide Border
<img src="https://ajit421.vercel.app/api/stats?username=ajit421&hide_border=true" height="150" />

### Custom Colors (Blue & Black)
<img src="https://ajit421.vercel.app/api/stats?username=ajit421&bg_color=0d1117&text_color=58a6ff&title_color=58a6ff" height="150" />

### Tokyo Night Theme + Icons
<img src="https://ajit421.vercel.app/api/stats?username=ajit421&show_icons=true&theme=tokyonight" height="150" />

### Top Languages (Donut Chart)
<img src="https://ajit421.vercel.app/api/top-langs?username=ajit421&theme=tokyonight&hide_border=true" height="150" />

### Streak Stats
<img src="https://ajit421.vercel.app/api/streak?username=ajit421&theme=tokyonight&hide_border=true" height="150" />

## 🛠️ Contributing
Contributions are welcome! Please open an issue or submit a pull request.