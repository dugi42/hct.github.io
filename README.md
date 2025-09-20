# Hockey Club Thaur "Die Ritter" Website

🏒 **Professional, modern website for Hockey Club Thaur - Die Ritter seit 1991**

## 🚀 Features

- **Professional Tailwind Design**: Modern utility-first CSS framework
- **Fully Responsive**: Perfect experience on all devices (mobile, tablet, desktop)
- **Interactive Game Center**: Three-tab system (Next Game, Last Result, Schedule)
- **Dynamic Gallery**: Filterable image gallery with modal popup functionality
- **German Language**: Authentic content for Austrian hockey club
- **Social Media Integration**: Direct links to Facebook and Instagram
- **Performance Optimized**: Fast loading with modern CSS and vanilla JavaScript
- **SEO Friendly**: Proper meta tags and semantic HTML structure

## 📁 Project Structure

```
hct.github.io/
├── index.html              # Main website (Tailwind CSS implementation)
├── simple.html             # Original Tailwind design
├── fused.html             # Combined version (archived)
├── test.html              # Testing page
├── css/
│   └── styles.css          # Legacy styles (archived)
├── js/
│   └── main.js             # Legacy JavaScript (archived)
├── images/
│   ├── logo.png            # Club logo
│   ├── favicon.ico         # Browser favicon
│   └── README.md           # Image requirements
├── package.json            # Project configuration
├── pyproject.toml         # Python dependencies
├── uv.lock                # UV lock file
└── README.md              # This file
```

## 🛠️ Technology Stack

- **HTML5**: Semantic markup with modern accessibility features
- **Tailwind CSS 3.x**:
  - Utility-first CSS framework
  - Responsive design system
  - Custom color scheme (#c8102e - HC Thaur red)
  - Modern component architecture
- **Vanilla JavaScript**:
  - Tab switching functionality
  - Gallery filtering system
  - Modal popup interactions
  - Mobile menu toggle
- **External Resources**:
  - Google Fonts (Inter family)
  - Pexels/Unsplash images
  - Tailwind CSS CDN
  - Social media integrations

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

## 📱 Website Sections

1. **Hero** - Stunning background with HC Thaur branding and call-to-action
2. **About** - Club history and values (German content)
3. **Game Center** - Interactive three-tab system:
   - Next Game display
   - Last result with score
   - Upcoming schedule table
4. **Team** - Player cards with photos and positions
5. **News** - Latest club news with professional card layout
6. **Gallery & Magazine** - Filterable photo gallery with categories:
   - All photos
   - Game action
   - Fans
   - Training/backstage
7. **Youth Spotlight** - Emphasis on youth development
8. **Partners** - Sponsor carousel with local businesses
9. **Social Media** - Facebook and Instagram integration
10. **Contact** - Complete contact information and arena details

## 🎮 Navigation & Interactions

- **Responsive Navigation**: Sticky header with mobile hamburger menu
- **Smooth Scrolling**: Click navigation links for smooth section transitions
- **Tab System**: Interactive game center with three content tabs
- **Gallery Filtering**: Click filter buttons to show specific photo categories
- **Modal Popups**: Click gallery images for enlarged view with details
- **Mobile-First**: Touch-friendly design optimized for all screen sizes
- **Social Links**: Direct links to official Facebook and Instagram pages

## 🎨 Customization

### Colors & Branding

The website uses a custom Tailwind configuration with HC Thaur brand colors:

```css
/* Primary brand color: #c8102e (HC Thaur red) */
/* Defined in Tailwind as hc-red class */
.hc-red { color: #c8102e; }
.bg-hc-red { background-color: #c8102e; }
```

To customize colors, update the CSS classes in `index.html` or modify the inline Tailwind configuration.

### Content Updates

- **German Language**: All text content is in German and can be edited directly in `index.html`
- **Game Schedule**: Update the game center tabs with current team information
- **Team Members**: Replace player photos and information in the team section
- **News Articles**: Update news cards with current club announcements
- **Contact Information**: Modify footer and contact details as needed

### Images & Media

- **Logo**: Replace placeholder logos with official HC Thaur branding
- **Player Photos**: Update team member images (recommend 150x150px, square format)
- **Gallery Images**: Replace gallery photos with actual club photos
- **Background Images**: Hero section uses Pexels hockey imagery
- **Favicon**: Add proper favicon files for browser tabs

## 🔧 Development

### Architecture

- **HTML**: Semantic markup with Tailwind CSS utility classes
- **Tailwind CSS**: Modern utility-first framework with responsive design
- **Vanilla JavaScript**: Lightweight interactions without external dependencies
- **CDN-Based**: Uses Tailwind CSS CDN for easy deployment and updates

### Key Features

- **Responsive Design**: Mobile-first approach with Tailwind's responsive utilities
- **Component-Based**: Reusable patterns using Tailwind component classes
- **Performance**: Optimized CSS delivery through CDN and minimal JavaScript
- **Maintainable**: Clean HTML structure with utility classes for styling
- **Accessible**: ARIA labels and semantic HTML for screen readers

### Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+, Samsung Internet 13+
- **Tailwind CSS**: Full support for modern CSS features and responsive design

## 📊 Performance & Features

- **Lighthouse Score**: Optimized for performance, accessibility, and SEO
- **Loading Time**: Fast CDN delivery of Tailwind CSS and minimal JavaScript
- **Mobile Optimized**: Touch-friendly interface with responsive breakpoints
- **Interactive Elements**:
  - Tab switching in game center
  - Gallery filtering system
  - Modal popup functionality
  - Mobile hamburger navigation
- **SEO Ready**: Semantic HTML structure with proper meta tags

## 🐛 Troubleshooting

### Common Issues

1. **Styling not working**:
   - Check Tailwind CSS CDN connection
   - Verify internet connection for external resources
   - Clear browser cache and reload

2. **JavaScript features not working**:
   - Check browser console for errors (F12)
   - Ensure JavaScript is enabled in browser
   - Verify all HTML elements have correct IDs

3. **Images not displaying**:
   - Check image URLs for external sources
   - Verify placeholder services (placehold.co) are accessible
   - Replace with local images if needed

### Debug Mode

Open browser developer tools (F12) to check console messages and network requests.

## 📞 Support

For technical support or questions:

- Email: [office@hc-thaur.at](mailto:office@hc-thaur.at)
- Facebook: [HC Die Ritter Thaur](https://www.facebook.com/HCDieRitterThaur/)
- Instagram: [@hc_thaur_die_ritter](https://www.instagram.com/hc_thaur_die_ritter/)
- GitHub Issues: [Create an issue](https://github.com/dugi42/hct.github.io/issues)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Tailwind CSS**: Modern utility-first CSS framework
- **Pexels & Unsplash**: High-quality hockey and sports photography
- **Google Fonts**: Inter font family for modern typography
- **Hockey Club Thaur**: Authentic content and branding
- **Tirol Hockey Community**: Support and inspiration

---

**Made with ❤️ for Hockey Club Thaur "Die Ritter"** 🏒⚔️

*Eishockey aus Leidenschaft seit 1991*
