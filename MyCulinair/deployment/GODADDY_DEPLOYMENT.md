# MyCulinaire - GoDaddy Deployment Guide

## 🚀 **GoDaddy Hosting Setup**

### **Step 1: Choose Your GoDaddy Plan**
- **Web Hosting Plus** ($8.99/month) - Recommended
- **Web Hosting Deluxe** ($12.99/month) - Better performance
- **VPS Hosting** ($20+/month) - Full control

### **Step 2: Upload Your Files**
1. **Login to GoDaddy** cPanel
2. **Go to File Manager**
3. **Navigate to public_html** folder
4. **Upload all files** from this deployment folder:
   - `public/` folder (all your app files)
   - `server.js` (Node.js server)
   - `package.json` (dependencies)
   - `.env` (environment variables)

### **Step 3: Install Dependencies**
1. **Open Terminal** in cPanel
2. **Run these commands:**
   ```bash
   npm install
   node server.js
   ```

### **Step 4: Configure Domain**
1. **Point your domain** to the hosting
2. **Update DNS** settings
3. **Enable SSL** certificate (free with GoDaddy)

### **Step 5: Environment Variables**
Update your `.env` file with production values:
```env
NODE_ENV=production
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
```

## 🔧 **GoDaddy Specific Settings**

### **Node.js Configuration**
- **Node.js version**: 18.x or higher
- **Port**: 3001 (or use GoDaddy's assigned port)
- **PM2**: Use PM2 to keep server running

### **PM2 Setup (Recommended)**
```bash
npm install -g pm2
pm2 start server.js --name myculinaire
pm2 startup
pm2 save
```

## 🌐 **Domain Setup**

### **DNS Configuration**
1. **A Record**: Point to GoDaddy server IP
2. **CNAME**: www.yourdomain.com → yourdomain.com
3. **SSL**: Enable free SSL certificate

### **Custom Domain**
- **Primary domain**: yourdomain.com
- **Subdomain**: app.yourdomain.com (optional)
- **SSL**: Automatic HTTPS

## 💰 **Cost Breakdown**
- **Domain**: $12-15/year
- **Hosting**: $8-20/month
- **SSL**: Free with GoDaddy
- **Total**: ~$10-25/month

## 🚀 **Deployment Checklist**
- [ ] Upload all files to public_html
- [ ] Install Node.js dependencies
- [ ] Configure environment variables
- [ ] Set up PM2 for process management
- [ ] Configure domain DNS
- [ ] Enable SSL certificate
- [ ] Test the application
- [ ] Set up monitoring

## 📞 **GoDaddy Support**
- **24/7 Support**: Available
- **Live Chat**: Quick help
- **Phone Support**: 1-866-938-1119
- **Documentation**: help.godaddy.com

## 🎉 **You're Live!**
Once deployed, your MyCulinaire app will be available at:
**https://yourdomain.com**

---

**Need Help?** Contact GoDaddy support or check their documentation for Node.js hosting setup.
