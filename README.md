# Hockey Club Thaur Website

🏒 **Modern, responsive website for Hockey Club Thaur - Eishockey mit Herz**

## 🚀 Features

- **Modern Design**: State-of-the-art CSS3 and ES6+ JavaScript
- **Responsive**: Perfect on all devices (mobile, tablet, desktop)
- **Interactive**: Full-page scrolling with smooth animations
- **Magazine Section**: Beautiful image gallery with auto-scroll
- **Performance Optimized**: Fast loading and smooth animations
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessibility**: ARIA labels and keyboard navigation

## 📁 Project Structure

```
hct.github.io/
├── index.html              # Main HTML file (clean, semantic)
├── css/
│   └── styles.css          # All CSS styles (organized, modern)
├── js/
│   └── main.js             # All JavaScript (ES6+, modular)
├── images/
│   ├── logo.png            # Club logo
│   ├── favicon.ico         # Browser favicon
│   └── README.md           # Image requirements
├── assets/                 # Additional assets
├── package.json            # Project configuration
└── README.md              # This file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: 
  - CSS Custom Properties (variables)
  - CSS Grid & Flexbox
  - Advanced animations and transitions
  - Responsive design with mobile-first approach
- **JavaScript ES6+**:
  - Classes and modules
  - Modern event handling
  - Performance optimizations
  - Intersection Observer API
- **External Libraries**:
  - Font Awesome 6.4.0 (icons)
  - Google Fonts (Poppins)
  - Facebook SDK (social integration)

## 🚀 Getting Started

### Prerequisites
- Python 3 (for local development server)
- Modern web browser
- Internet connection (for external assets)

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dugi42/hct.github.io.git
   cd hct.github.io
   ```

2. **Start local development server**:
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser**:
   ```
   http://localhost:8080
   ```

### Adding Your Logo

1. Add your club logo as `images/logo.png` (recommended size: 280x280px)
2. Create favicon files:
   - `images/favicon.ico` (16x16, 32x32px)
   - `images/favicon.png` (32x32px)
   - `images/apple-touch-icon.png` (180x180px)

## 📱 Sections

1. **Home** - Hero section with logo and CTAs
2. **About** - Club information and history
3. **Schedule** - Game schedule table
4. **Team** - Player cards with animations
5. **Gallery** - Interactive magazine-style image gallery
6. **Sponsors** - Partner logos and information
7. **Social** - Facebook integration
8. **Contact** - Contact information and forms

## 🎮 Navigation

- **Mouse**: Scroll wheel to navigate between sections
- **Keyboard**: 
  - Arrow keys (↑↓) for navigation
  - Space bar for next section
  - Home/End keys for first/last section
- **Touch**: Swipe gestures on mobile devices
- **Navigation Dots**: Click dots on the right side
- **CTA Buttons**: Click buttons to jump to sections

## 🎨 Customization

### Colors
Edit CSS custom properties in `css/styles.css`:
```css
:root {
    --primary-color: #d90429;    /* Club red */
    --secondary-color: #2b2d42;  /* Dark blue */
    --accent-color: #8ecae6;     /* Light blue */
    /* ... more colors */
}
```

### Content
- Edit text content directly in `index.html`
- Update team members in the team section
- Modify schedule in the schedule table
- Update contact information

### Images
- Replace images in the `images/` folder
- Update image paths in HTML if needed
- Optimize images for web performance

## 🔧 Development

### File Organization
- **HTML**: Clean, semantic markup separated from styling and behavior
- **CSS**: Organized with comments, using modern features
- **JavaScript**: Modular ES6+ classes for maintainability

### Performance Features
- Lazy loading for images
- Debounced scroll events
- Optimized animations
- Preloading for adjacent sections
- Compressed external assets

### Browser Support
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Loading Time**: < 3 seconds on 3G connection
- **Bundle Size**: Optimized CSS and JS
- **Image Optimization**: WebP support with fallbacks

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**:
   - Check file paths in HTML
   - Ensure images exist in `images/` folder
   - Verify image file formats

2. **JavaScript not working**:
   - Check browser console for errors
   - Ensure `js/main.js` is loaded correctly
   - Verify all DOM elements exist

3. **Styling issues**:
   - Check CSS file path
   - Verify CSS custom properties support
   - Clear browser cache

### Debug Mode
Open browser developer tools (F12) and check console for debug information.

## 📞 Support

For technical support or questions:
- Email: [hockey@hc-thaur.at](mailto:hockey@hc-thaur.at)
- GitHub Issues: [Create an issue](https://github.com/dugi42/hct.github.io/issues)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Unsplash**: High-quality hockey images
- **Font Awesome**: Beautiful icons
- **Google Fonts**: Modern typography
- **Hockey community**: Inspiration and feedback

---

**Made with ❤️ for Hockey Club Thaur** 🏒
