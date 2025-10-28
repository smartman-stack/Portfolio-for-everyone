# Portfolio for Everyone - Full Stack Next.js App

A beautiful, customizable portfolio website with an admin panel to manage content and styles.

## Features

- **Main Page**: Beautiful one-page portfolio with no scrollbars
- **Dynamic Navbar**: Choose between vertical or horizontal orientation
- **Custom Cursor**: Windy, strong, or minimal glow effects
- **Customizable Colors**: Primary, secondary, and accent colors
- **Skills Display**: Show skills with progress bars
- **Experience Section**: Collapsible experience cards
- **Optional Photo**: Profile photo that shows/hides based on content
- **Admin Panel**: Protected admin page to edit all content and styles

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will create the SQLite database file (`dev.db`) with all necessary tables.

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How to Login as Admin

### First Time Setup

1. Open your browser and go to `http://localhost:3000/login`
2. Enter any email (e.g., `admin@example.com`)
3. Enter any password (e.g., `admin123`)
4. Click "Login"

The first login attempt will automatically create an admin account with the credentials you provided.

### Subsequent Logins

After creating your admin account, use the same email and password to log in.

## Available Pages

- **Main Portfolio** (`/`): Public-facing portfolio page
- **Admin Login** (`/login`): Admin authentication page
- **Admin Panel** (`/hiddenpage`): Protected page to edit portfolio content and styles

## Admin Panel Features

The admin panel allows you to:

### Edit Profile Information
- Display name
- Headline
- Bio
- Photo URL (optional - if empty, photo section will not show)

### Manage Skills
- Add/remove skills
- Set skill name
- Set proficiency level (0-100%)
- Add skill description

### Manage Experience
- Add/remove work experiences
- Set title and company
- Set start and end dates
- Add description

### Customize Styles
- **Navbar Orientation**: Horizontal or Vertical
- **Primary Color**: Main brand color (navbar background)
- **Secondary Color**: Page background
- **Accent Color**: Text highlights and accents
- **Cursor Style**: Windy, Strong, or Minimal
- **Show Cursor**: Toggle custom cursor on/off
- **Text Alignment**: Left, Center, or Right

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── hiddenpage/   # Admin panel (protected)
│   │   ├── login/        # Login page
│   │   ├── page.tsx      # Main portfolio page
│   │   └── layout.tsx    # Root layout
│   ├── lib/
│   │   ├── prisma.ts     # Prisma client
│   │   └── auth.ts       # Authentication utilities
│   └── middleware.ts     # Auth middleware
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## API Endpoints

- `GET /api/portfolio` - Fetch portfolio data
- `PUT /api/portfolio` - Update portfolio data
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

## Database Schema

- **AdminUser**: Admin account credentials
- **Portfolio**: Main portfolio data
- **Skill**: Skills with proficiency levels
- **Experience**: Work experiences
- **StyleSettings**: Customization options

## Technologies Used

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- JWT Authentication
- bcrypt for password hashing

## Tips

1. **Photo URL**: Use a publicly accessible image URL (e.g., from Imgur, GitHub, or your hosting service)
2. **Colors**: Use hex color codes (e.g., `#0ea5e9`)
3. **First Login**: The first admin account is auto-created when you log in for the first time
4. **Navigation**: Navbar automatically adjusts based on orientation setting
5. **No Scroll**: The main page has `overflow-hidden` to ensure no scrollbars appear

## Troubleshooting

### Module not found error
If you see `@prisma/client` module errors, run:
```bash
npx prisma generate
```

### Database errors
If you have database issues, reset with:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Build errors
Make sure to run:
```bash
npx prisma generate
npm run dev
```

Enjoy your customizable portfolio! 🚀

