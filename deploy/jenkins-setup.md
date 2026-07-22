# Jenkins CI/CD — qismlarga bo'lingan qo'llanma

Loyiha: push → Jenkins avtomatik test → Docker build → deploy

> Lokal Jenkins (`localhost:8081`) uchun **Poll SCM** ishlatamiz.
> GitHub Webhook lokalga to'g'ridan yetib bormaydi (ngrok kerak bo'ladi).

---

## QISM 0 — Jenkins ishlayaptimi?

```powershell
.\scripts\run-jenkins.ps1
```

- UI: http://localhost:8081
- Parol: script chiqaradi yoki  
  `docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`

**Muhim:** eski Jenkins image'da `docker` yo'q edi (exit 127).
`scripts/run-jenkins.ps1` endi Docker CLI bilan **qayta build** qiladi.

---

## QISM 1 — Pipeline job sozlash (bir marta)

1. Jenkins → **java-simple-pipeline** → **Настройки (Configure)**
2. Pastga scroll → **Pipeline**
3. To'ldiring:

| Maydon | Qiymat |
|--------|--------|
| Definition | **Pipeline script from SCM** |
| SCM | **Git** |
| Repository URL | `https://github.com/Jakhongir99/Simple-Backend-Project-With-SpringBoot-React-Postgres.git` |
| Branch Specifier | `*/main`  ← `master` emas! |
| Script Path | `Jenkinsfile` |

4. Hali **Save** bosmang — QISM 2 ga o'ting.

---

## QISM 2 — Har push'da avtomatik ishga tushirish

**Triggers / Триггеры** bo'limida:

1. Belgilang: **Опрашивать SCM об изменениях** (Poll SCM)
2. Schedule maydoniga yozing:

```
H/2 * * * *
```

Bu = taxminan **har 2 daqiqada** GitHub'ni tekshiradi.
Push qilsangiz, 0–2 daqiqa ichida yangi build boshlanadi.

3. Endi **Save** bosing.

### Nima uchun Webhook emas?

| Usul | Lokal Jenkins |
|------|----------------|
| Poll SCM | Ishlaydi (tavsiya) |
| GitHub Webhook | `localhost` ga internetdan kira olmaydi |

Keyin serverga chiqarganda Webhook qo'shiladi.

---

## QISM 3 — Birinchi marta qo'lda tekshirish

1. **Собрать сейчас (Build Now)** bosing
2. Build History'da #3 (yoki keyingi raqam) chiqadi
3. Ustiga bosib → **Console Output**

Kutiladigan bosqichlar (`Jenkinsfile`):

```
1. Checkout          → GitHub'dan kod
2. Test              → mvn test
3. Build Backend     → Docker image
4. Build Frontend    → Docker image
5. Deploy Production → docker compose prod up
```

Yashil ✅ = muvaffaqiyat.
Qizil ❌ = Console Output'dagi xatoni o'qing.

---

## QISM 4 — Auto deploy sinovi (push)

1. Kodda kichik o'zgarish qiling (masalan README'ga 1 qator)
2. Commit + push `main` ga
3. 1–2 daqiqa kuting
4. Jenkins'da **yangi build** avtomatik chiqishi kerak
5. Success bo'lsa: http://localhost:3000 yangilangan app

---

## QISM 5 — Kundalik ish tartibi

```
Kod yozdingiz
    ↓
git push origin main
    ↓
Jenkins Poll SCM sezadi (≤2 daqiqa)
    ↓
Test → Build → Deploy
    ↓
Brauzerda localhost:3000 / 8080
```

To'xtatish:

```powershell
.\scripts\stop-all.ps1
```

Hammasi (App + Jenkins):

```powershell
.\scripts\run-all.ps1
```

---

## Xatolar tez yordam

| Xato | Yechim |
|------|--------|
| `couldn't find remote ref master` | Branch = `*/main` |
| `exit code 127` / docker not found | `.\scripts\run-jenkins.ps1` (rebuild) |
| Build umuman boshlanmaydi | Poll SCM + `H/2 * * * *` belgilanganmi? |
| Port band | `.\scripts\stop-dev.ps1` — local va Docker birga emas |
| `container name ... already in use` | Eski stack qolgan. `.\scripts\stop-docker.ps1` yoki Build Now (yangi Jenkinsfile avval tozalaydi) |

---

## URLlar

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui/index.html |
| Jenkins | http://localhost:8081 |
