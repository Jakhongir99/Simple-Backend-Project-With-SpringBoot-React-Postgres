# Jenkins + Docker CI/CD

## 1. Jenkins ishga tushirish

**Docker Desktop** ishga tushirilgan bo'lishi shart. Aks holda `dockerDesktopLinuxEngine` xatosi chiqadi.

```powershell
.\run-jenkins.ps1
```

yoki:

```bash
docker compose -f docker-compose.jenkins.yml up -d
```

Jenkins UI: http://localhost:8081

### Administrator parol qayerdan?

Script o'zi chiqaradi. Qo'lda:

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Shu uzun kodni Jenkins sahifasidagi "Administrator password" maydoniga joylang → **Continue**.

To'xtatish:

```powershell
.\stop-jenkins.ps1
```

## 2. Jenkins pluginlar

Setup wizardda tanlang:

- Docker Pipeline
- Docker
- Git
- Pipeline
- Credentials Binding

## 3. Pipeline yaratish

1. **New Item** → `java-simple-pipeline` → **Pipeline**
2. **Pipeline** → Definition: **Pipeline script from SCM**
3. SCM: **Git**
4. Repository URL: `https://github.com/Jakhongir99/Simple-Backend-Project-With-SpringBoot-React-Postgres.git`
5. Branch: `*/main`
6. Script Path: `Jenkinsfile`
7. Save → **Build Now**

## 4. Production deploy (manual)

```bash
cp .env.prod.example .env.prod
# .env.prod ichidagi parollarni o'zgartiring

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

## 5. URLlar

| Service | URL |
|---------|-----|
| Frontend (prod) | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Health | http://localhost:8080/actuator/health |
| Jenkins | http://localhost:8081 |

## 6. Pipeline bosqichlari

1. Checkout
2. Test (Maven in Docker)
3. Build backend image
4. Build frontend image
5. Deploy (`main` branchda `docker-compose.prod.yml`)
