# Beat Alignment Web Frontend

A modern, responsive web interface for the Beat Alignment API that runs on GitHub Pages.

## 🌟 Features

- **Drag & Drop Upload**: Intuitive file upload with visual feedback
- **Real-time Progress**: Live status updates during processing
- **Advanced Settings**: Customizable beat detection and alignment parameters
- **Video Player**: Built-in player for previewing results
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **Professional UI**: Modern gradient design with smooth animations

## 📱 Responsive Design

The interface adapts to all screen sizes:
- **Desktop**: Full-featured layout with side-by-side controls
- **Tablet**: Optimized grid layout for touch interaction
- **Mobile**: Single-column stack with large touch targets

## 🛠 Deployment to GitHub Pages

### Step 1: Prepare Your Repository

1. **Clone or initialize your GitHub repository:**
```bash
git clone git@github.com:zhangsh1416/beat_alignment.github.io.git
cd beat_alignment.github.io
```

2. **Copy the frontend files:**
```bash
# Copy all files from the frontend directory to your repo root
cp /path/to/beat_alignment/frontend/* .
```

Your repository should contain:
```
index.html
styles.css
script.js
README.md
```

### Step 2: Configure GitHub Pages

1. **Push files to GitHub:**
```bash
git add .
git commit -m "Add Beat Alignment web interface"
git push origin main
```

2. **Enable GitHub Pages:**
   - Go to your repository settings on GitHub
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

3. **Access your site:**
   - Your site will be available at: `https://zhangsh1416.github.io/beat_alignment.github.io/`
   - GitHub will show you the URL in the Pages settings

### Step 3: Update API Configuration

Since GitHub Pages serves static files, you'll need to run your API server locally and configure the frontend to connect to it.

1. **Start your local API server:**
```bash
conda activate beat_alignment
python api_server.py
```

2. **Configure API URL in the web interface:**
   - Click "API Info" in the footer of your web app
   - Set API Server URL to: `http://localhost:8000`
   - Click "Save Configuration"

## 🚀 How It Works

### User Journey:
1. **Upload**: Drag video file or click to browse
2. **Configure**: Adjust beat alignment settings (optional)
3. **Process**: Click "Generate Highlight" to start processing
4. **Monitor**: Watch real-time progress updates
5. **Download**: Preview and download the result

### Technical Flow:
1. **Frontend** → Uploads video to local API server
2. **API Server** → Processes video using your existing code
3. **Frontend** → Polls for status updates every 5 seconds
4. **Result** → Streams video player and download link

## 🎛 Advanced Settings

The interface exposes all your API parameters:

- **Beat Alignment**: Enable/disable beat synchronization
- **Beat Sensitivity**: Adjust detection threshold (0.3-1.0)
- **Shot Length**: Minimum and maximum scene duration
- **API Key**: Optional Gemini API key override

## 🔧 Customization

### Branding
- Update `index.html` title and header text
- Modify color scheme in `styles.css` (CSS custom properties)
- Replace logo icon in the header

### API Integration
- Update `apiBaseUrl` in `script.js` for different server configurations
- Modify parameter names to match your API changes
- Add new settings by extending the settings panel

### Styling
- Colors defined in CSS custom properties (`:root`)
- Responsive breakpoints at 768px for mobile
- All animations and transitions configurable

## 📊 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Features Used**: 
  - Fetch API (native AJAX)
  - CSS Grid and Flexbox
  - CSS Custom Properties
  - HTML5 Video Element

## 🛡 Security Considerations

### For Production:
1. **CORS Configuration**: Update API server to only allow your GitHub Pages domain
2. **API Key Protection**: Implement server-side key management
3. **File Size Limits**: Enforce reasonable upload limits
4. **Rate Limiting**: Add request throttling to prevent abuse

### Current Security Features:
- File type validation (video formats only)
- File size limits (500MB max)
- Input sanitization for all parameters
- HTTPS serving via GitHub Pages

## 🌐 Live Demo

Once deployed, your web app will be available at:
`https://zhangsh1416.github.io/beat_alignment.github.io/`

## 📝 Development Notes

### Local Testing:
```bash
# Serve locally for development
python -m http.server 8080
# Access at: http://localhost:8080
```

### API Server Configuration:
The frontend is designed to work with your local API server. For cloud deployment, you'd need to:
1. Deploy the API server to a cloud service (AWS, Google Cloud, etc.)
2. Update the API URL in the frontend
3. Configure proper CORS and authentication

This creates a professional, user-friendly interface for your beat alignment system that can be easily shared and accessed via GitHub Pages! 🎉