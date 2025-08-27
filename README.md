# 🌟 Modern Blog Platform - React Frontend

A full-featured, responsive blog platform built with React.js, featuring dark/light theme toggle, user authentication, post management, and modern UI design.

![Blog Platform](https://img.shields.io/badge/React-18.x-blue.svg)
![Theme Toggle](https://img.shields.io/badge/Theme-Dark%2FLight-purple.svg)
![Responsive](https://img.shields.io/badge/Design-Responsive-green.svg)

## 🚀 Features

### ✨ Core Features

- **🔐 User Authentication**: Secure login/signup with JWT tokens
- **📝 Post Management**: Create, edit, delete blog posts with rich text editor
- **💬 Comments System**: Add comments to posts with user authentication
- **🏷️ Category Management**: Organize posts by categories (Admin only)
- **🔍 Search Functionality**: Search posts by title and content
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🎨 Modern UI/UX

- **🌙 Dark/Light Theme Toggle**: Switch between themes with one click
- **🎯 Auto-scrolling Carousel**: Smooth image carousel on homepage
- **💫 Modern Animations**: Smooth transitions and hover effects
- **🎨 Gradient Designs**: Beautiful gradients and modern styling
- **📐 Clean Layout**: Professional, minimalist design

### 🛡️ Security & Performance

- **🔒 JWT Authentication**: Secure token-based authentication
- **💾 IndexedDB Storage**: Client-side storage for auth tokens
- **🔄 Auto Token Refresh**: Automatic token renewal system
- **🛡️ Role-based Access**: Admin and User role management
- **⚡ Optimized Performance**: Fast loading and smooth interactions

## 🏗️ Project Structure

```
react-blog/
├── public/
│   ├── index.html
│   └── images/
├── src/
│   ├── component/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── HeroCarousel/
│   │   └── privateroute.js
│   ├── pages/
│   │   ├── Home.js/css
│   │   ├── Posts.js/css
│   │   ├── About.js/css
│   │   ├── Auth.js/css
│   │   ├── Addpost.js/css
│   │   ├── EditPost.js
│   │   ├── ProfileInfo.js/css
│   │   └── CategoryManagement.js/css
│   ├── services/
│   │   ├── posts.js
│   │   ├── users.js
│   │   ├── comments.js
│   │   ├── categories.js
│   │   └── user_service.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── indexdb/
│   │   └── indexdb.js
│   └── image/
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React.js 18.x
- **Styling**: CSS3 with custom themes
- **Routing**: React Router DOM
- **State Management**: React Context API + Hooks
- **Rich Text Editor**: Jodit React Editor
- **HTTP Client**: Axios
- **Storage**: IndexedDB for client-side storage
- **Authentication**: JWT tokens with refresh mechanism
- **Icons**: Emoji-based icons for modern look

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running

### 1. Clone the Repository

```bash
git clone https://github.com/Ravi8264/Frontend_Blog-.git
cd Frontend_Blog-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com/api
```

### 4. Start Development Server

```bash
npm start
```

The app will run on `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## 🎯 Key Pages & Features

### 🏠 Home Page

- Auto-scrolling hero carousel
- Featured posts carousel
- Responsive design with theme support
- Contact information integration

### 📝 Posts Page

- Complete post listing with pagination
- Search functionality
- Comment system
- Post management (edit/delete for authors)

### 👤 Authentication

- Login/Signup forms
- Password validation
- JWT token management
- Automatic token refresh

### ⚙️ Admin Features

- Category management
- User role management
- Post moderation capabilities

### 🎨 Theme System

- Global dark/light theme toggle
- Persistent theme preference
- Smooth theme transitions
- Consistent styling across all pages

## 🔧 Configuration

### API Integration

The app is configured to work with a Spring Boot backend. Update the base URL in services files:

```javascript
const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com/api/v1";
```

### Theme Customization

Themes can be customized in individual CSS files using CSS variables:

```css
/* Dark Theme */
.dark-theme {
  --bg-primary: #0b0f19;
  --text-primary: #f9fafb;
  --card-bg: #0f172a;
}

/* Light Theme */
.light-theme {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --card-bg: #ffffff;
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Ravi Shankar Kumar**

- 📧 Email: ravi.kumar@thinkvista.in
- 📱 Phone: 8709931070
- 🔗 GitHub: [@Ravi8264](https://github.com/Ravi8264)

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Modern CSS techniques for responsive design
- JWT authentication best practices
- IndexedDB for efficient client-side storage

---

⭐ **If you like this project, please give it a star!** ⭐

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/Ravi8264/Frontend_Blog-.git
cd Frontend_Blog-
npm install

# Development
npm start

# Production build
npm run build

# Deploy build folder to your hosting service
```

## 📊 Project Stats

- **Components**: 15+ reusable components
- **Pages**: 8 main pages
- **Features**: 20+ key features
- **Theme Support**: Complete dark/light theme system
- **Responsive**: 100% mobile-friendly
- **Performance**: Optimized for fast loading

---

**Built with ❤️ using React.js and modern web technologies**
