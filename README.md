# Car Wash CDN

Private GitHub repository kullanılarak oluşturulmuş ücretsiz CDN altyapısı.

## Klasör Yapısı

```
car-wash-cdn/
├── .github/
│   ├── workflows/
│   │   └── optimize-images.yml  # Otomatik görsel optimizasyonu
│   └── scripts/
│       └── optimize.js          # Sharp ile optimizasyon scripti
├── original/                     # Orijinal yüklenen görseller
│   ├── firms/logos/
│   ├── users/profiles/
│   └── appointments/photos/
└── optimized/                    # GitHub Actions ile optimize edilmiş görseller
    ├── firms/logos/
    ├── users/profiles/
    └── appointments/photos/
```

## Kategoriler ve Kullanım

| Kategori | Klasör | Max Boyut | Format | Kullanım |
|----------|--------|-----------|--------|----------|
| Firma Logo | `firms/logos` | 500KB | PNG, JPEG, WebP | Arama sayfası, firma detay |
| Profil Foto | `users/profiles` | 200KB | PNG, JPEG | Kullanıcı profili, yorumlar |
| Randevu Foto | `appointments/photos` | 2MB | JPEG | Randevu tamamlama, fotoğraf kanıtı |

## Optimizasyon Ayarları

### Firma Logoları
- Max Boyut: 800x800px
- Format: WebP
- Kalite: 85%

### Profil Fotoları
- Max Boyut: 400x400px
- Format: WebP
- Kalite: 80%

### Randevu Fotoları
- Max Boyut: 1920x1080px
- Format: JPEG
- Kalite: 85%

## Çalışma Mantığı

1. Backend, orijinal görseli `original/{category}/` klasörüne yükler (GitHub API ile)
2. GitHub Actions tetiklenir ve Sharp ile görseli optimize eder
3. Optimize edilmiş görsel `optimized/{category}/` klasörüne commit edilir
4. Backend, optimize edilmiş görseli cache'leyerek serve eder

## Güvenlik

Bu repo **private** olmalıdır. Erişim için GitHub Personal Access Token (PAT) kullanılır.

### Gerekli Token Permissions
- `repo` (full control)

## Sınırlamalar

- GitHub repo maksimum boyut: 5GB (önerilen)
- GitHub API rate limit: 5000 request/hour (authenticated)
- Otomatik optimizasyon: ~30 saniye sürer

## Backend Entegrasyonu

Backend tarafında `github-cdn-kit` npm paketi kullanılarak bu repoya erişim sağlanır.

```typescript
const cdn = new GitHubCDNClient({
  mode: 'private',
  repo: {
    owner: 'YOUR_USERNAME',
    name: 'car-wash-cdn',
    token: process.env.GITHUB_CDN_TOKEN,
  },
  // ... diğer ayarlar
})
```
