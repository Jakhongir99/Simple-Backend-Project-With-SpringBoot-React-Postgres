Write-Host "🚀 Deploying to Heroku..." -ForegroundColor Green

Write-Host "`n📦 Building the application..." -ForegroundColor Yellow
mvn clean package -DskipTests

Write-Host "`n🔐 Setting up Heroku app..." -ForegroundColor Yellow
heroku create your-app-name-here

Write-Host "`n🗄️ Adding PostgreSQL database..." -ForegroundColor Yellow
heroku addons:create heroku-postgresql:mini

Write-Host "`n⚙️ Setting environment variables..." -ForegroundColor Yellow
heroku config:set SPRING_PROFILES_ACTIVE=prod
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
heroku config:set GOOGLE_CLIENT_ID=your-google-client-id
heroku config:set GOOGLE_CLIENT_SECRET=your-google-client-secret
heroku config:set GITHUB_CLIENT_ID=your-github-client-id
heroku config:set GITHUB_CLIENT_SECRET=your-github-client-secret

Write-Host "`n🚀 Deploying to Heroku..." -ForegroundColor Yellow
git add .
git commit -m "Deploy to Heroku"
git push heroku main

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://your-app-name-here.herokuapp.com" -ForegroundColor Cyan
Write-Host "`n📊 Check logs with: heroku logs --tail" -ForegroundColor White
Write-Host "🗄️ Check database with: heroku pg:info" -ForegroundColor White
Write-Host "`n" -ForegroundColor White

Read-Host "Press Enter to continue..."
