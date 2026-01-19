# Backoffice React Boilerplate

A modern, secure React 19 boilerplate with TypeScript, Vite, shadcn/ui, Tailwind CSS, and Zustand for state management. Features a complete authentication system with enhanced security measures.

## 🚀 Features

- ⚛️ **React 19** - Latest React version with improved performance
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 📘 **TypeScript** - Type-safe development
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 🔐 **Zustand** - Lightweight state management
- 🛡️ **Enhanced Security** - Multiple security layers for authentication

## 🔒 Security Features

This boilerplate implements several security enhancements for JWT authentication:

### 1. **Encrypted Token Storage**
- Tokens are encrypted before being stored in sessionStorage
- Adds an extra layer of security compared to plain text storage
- Uses a simple encryption algorithm to obfuscate tokens

### 2. **CSRF Token Protection**
- Unique CSRF token generated on login
- Should be included in all state-changing requests
- Prevents Cross-Site Request Forgery attacks

### 3. **Device Fingerprinting**
- Generates unique device fingerprint based on browser/system properties
- Tokens are bound to specific devices
- Invalid tokens from different devices are automatically rejected

### 4. **Automatic Token Refresh**
- Access tokens automatically refreshed before expiration
- Uses refresh tokens for seamless re-authentication
- Maintains user session without interruption

### 5. **Input Sanitization**
- All user inputs sanitized to prevent XSS attacks
- Email validation enforced
- Strong password requirements (min 8 chars, uppercase, lowercase, number, special character)

### 6. **Session Storage over Local Storage**
- Uses sessionStorage instead of localStorage
- Tokens cleared when browser is closed
- Reduces attack window for token theft

### 7. **Token Expiration Checks**
- Validates token expiration before use
- Proactive refresh when token nears expiry (5 min threshold)
- Automatic logout on invalid/expired tokens

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/get-caveo/backoffice-react.git
cd backoffice-react

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## 🛠️ Development

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
backoffice-react/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── security.ts      # Security utilities
│   │   └── utils.ts         # Helper functions
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── services/
│   │   └── auth.service.ts  # Authentication service
│   ├── store/
│   │   └── auth.store.ts    # Zustand auth store
│   ├── types/
│   │   └── auth.ts          # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── .env.example
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔑 Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Generation**: Server returns JWT access and refresh tokens
3. **Secure Storage**: Tokens encrypted and stored in sessionStorage with device fingerprint
4. **CSRF Protection**: CSRF token generated and stored
5. **Auto Refresh**: Access token automatically refreshed before expiration
6. **Protected Routes**: Routes require valid authentication
7. **Logout**: Tokens cleared and user redirected to login

## 🧪 Demo Credentials

For testing purposes, use these credentials:

- **Email**: demo@example.com
- **Password**: Demo@1234

## 🔐 Production Deployment

Before deploying to production:

1. **Replace Mock Authentication**: Update `src/services/auth.service.ts` with real API calls
2. **Environment Variables**: Configure proper API endpoints in `.env`
3. **HTTPS Only**: Ensure your application runs over HTTPS
4. **Secure Cookies**: Consider using httpOnly cookies for token storage
5. **Rate Limiting**: Implement rate limiting on login/register endpoints
6. **Strong Encryption**: Use proper encryption libraries (e.g., Web Crypto API)
7. **Backend Validation**: Always validate and verify JWTs on the backend

## 📚 Technologies Used

- [React 19](https://react.dev/) - UI library
- [Vite](https://vite.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Router](https://reactrouter.com/) - Routing
- [Lucide React](https://lucide.dev/) - Icons

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
