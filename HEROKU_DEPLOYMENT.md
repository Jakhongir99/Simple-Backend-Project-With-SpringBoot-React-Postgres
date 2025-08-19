# 🚀 Heroku Deployment Guide

This guide will help you deploy your Java CRUD application to Heroku.

## 📋 Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git Repository**: Your code should be in a Git repository
4. **Java 17**: Ensure you have Java 17 installed locally

## 🔧 Step-by-Step Deployment

### 1. Install Heroku CLI

```bash
# Windows (using winget)
winget install --id=Heroku.HerokuCLI

# Or download from the official website
# https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku

```bash
heroku login
```

### 3. Navigate to Your Project

```bash
cd D:\PROJECTS\JAVA\JAVA_SIMPLE
```

### 4. Create Heroku App

```bash
heroku create your-app-name-here
```

**Replace `your-app-name-here` with your desired app name.**

### 5. Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:mini
```

### 6. Set Environment Variables

```bash
# Spring Profile
heroku config:set SPRING_PROFILES_ACTIVE=prod

# JWT Secret (generate a strong secret)
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth2 (if using)
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth2 (if using)
heroku config:set GITHUB_CLIENT_ID=your-github-client-id
heroku config:set GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 7. Build the Application

```bash
mvn clean package -DskipTests
```

### 8. Deploy to Heroku

```bash
# Add all files to Git
git add .

# Commit changes
git commit -m "Deploy to Heroku"

# Push to Heroku
git push heroku main
```

### 9. Open Your App

```bash
heroku open
```

## 🔍 Check Deployment Status

### View Logs

```bash
heroku logs --tail
```

### Check Database

```bash
heroku pg:info
```

### Check App Status

```bash
heroku ps
```

## 🌐 Frontend Deployment

For the React frontend, you have several options:

### Option 1: Deploy to Heroku (Separate App)

1. **Create a new Heroku app for frontend**
2. **Add Node.js buildpack**
3. **Deploy the `crud-frontend` folder**

### Option 2: Deploy to Netlify/Vercel

1. **Build the frontend**: `npm run build`
2. **Deploy the `dist` folder to Netlify or Vercel**

### Option 3: Serve from Backend

1. **Build the frontend**: `npm run build`
2. **Copy `dist` contents to `src/main/resources/static/`**
3. **Redeploy backend**

## ⚠️ Important Notes

### Database Migration

- **Liquibase is disabled** in production profile
- **Use manual database setup** or enable Liquibase if needed
- **Heroku provides `DATABASE_URL` automatically**

### Environment Variables

- **Never commit secrets** to Git
- **Use Heroku config vars** for sensitive data
- **Update OAuth redirect URIs** to include your Heroku domain

### CORS Configuration

- **Update CORS settings** to allow your frontend domain
- **Configure allowed origins** in `SecurityConfig.java`

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   heroku logs --tail
   mvn clean package -DskipTests
   ```

2. **Database Connection Issues**

   ```bash
   heroku pg:info
   heroku config:get DATABASE_URL
   ```

3. **Port Issues**

   - Heroku sets `PORT` environment variable
   - Ensure your app uses `System.getenv("PORT")`

4. **Memory Issues**
   ```bash
   heroku ps:scale web=1
   heroku logs --tail
   ```

### Performance Optimization

1. **Enable JVM optimizations**
2. **Use connection pooling**
3. **Enable caching**
4. **Monitor with Heroku metrics**

## 📊 Monitoring

### Heroku Dashboard

- **Metrics**: CPU, memory, response time
- **Logs**: Application and system logs
- **Database**: PostgreSQL performance

### External Monitoring

- **New Relic**: Application performance
- **Logentries**: Log aggregation
- **Pingdom**: Uptime monitoring

## 🔄 Continuous Deployment

### GitHub Integration

1. **Connect GitHub repository** to Heroku
2. **Enable automatic deploys** on push to main
3. **Set up review apps** for pull requests

### CI/CD Pipeline

1. **GitHub Actions** for testing
2. **Heroku releases** for deployment
3. **Environment-specific configs**

## 💰 Cost Management

### Free Tier (Discontinued)

- **No more free dynos**
- **Consider alternatives**: Railway, Render, Fly.io

### Paid Plans

- **Basic Dyno**: $7/month
- **Standard Dyno**: $25/month
- **Performance Dyno**: $250/month

## 🎯 Next Steps

1. **Test your deployed application**
2. **Set up monitoring and alerts**
3. **Configure custom domain** (if needed)
4. **Set up SSL certificates**
5. **Implement backup strategies**

## 📚 Additional Resources

- [Heroku Java Documentation](https://devcenter.heroku.com/articles/java-support)
- [Spring Boot on Heroku](https://spring.io/guides/gs/spring-boot/)
- [PostgreSQL on Heroku](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Heroku CLI Reference](https://devcenter.heroku.com/articles/heroku-cli)

---

**Happy Deploying! 🚀**
