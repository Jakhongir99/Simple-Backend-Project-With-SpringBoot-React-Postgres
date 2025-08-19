@echo off
echo 🚀 Deploying to Heroku...

echo.
echo 📦 Building the application...
call mvn clean package -DskipTests

echo.
echo 🔐 Setting up Heroku app...
heroku create your-app-name-here

echo.
echo 🗄️ Adding PostgreSQL database...
heroku addons:create heroku-postgresql:mini

echo.
echo ⚙️ Setting environment variables...
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
heroku config:set GITHUB_CLIENT_ID=your-github-client-id
heroku config:set GITHUB_CLIENT_SECRET=your-github-client-secret

echo.
echo 🚀 Deploying to Heroku...
git add .
git commit -m "Deploy to Heroku"
git push heroku main

echo.
echo ✅ Deployment complete!
echo 🌐 Your app is available at: https://your-app-name-here.herokuapp.com
echo.
echo 📊 Check logs with: heroku logs --tail
echo 🗄️ Check database with: heroku pg:info
echo.
pause
