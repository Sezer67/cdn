const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

// Kategori bazlı optimize ayarları
const CONFIG = {
  'firms/logos': {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
    format: 'webp',
  },
  'users/profiles': {
    maxWidth: 400,
    maxHeight: 400,
    quality: 80,
    format: 'webp',
  },
  'appointments/photos': {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'jpeg',
  },
}

// Default config (eğer kategori CONFIG'de yoksa)
const DEFAULT_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  format: 'webp',
}

// Path'ten category çıkar (örn: "original/car-wash/firms/logos/test.jpg" -> "firms/logos")
function extractCategory(filePath) {
  const parts = filePath.split(path.sep)
  // original/[project]/[category]/[subcategory]/file.jpg formatını handle et
  const originalIndex = parts.indexOf('original')
  if (originalIndex === -1) return null
  
  // original'den sonraki tüm directory'leri al (project hariç son 2 directory category olsun)
  const afterOriginal = parts.slice(originalIndex + 1)
  
  // Son eleman dosya adı, ondan önceki 2 klasör category
  if (afterOriginal.length >= 3) {
    // örn: ["car-wash", "firms", "logos", "file.jpg"] -> "firms/logos"
    return afterOriginal.slice(-3, -1).join('/')
  }
  
  return null
}

async function optimizeImage(inputPath, outputPath, config) {
  const image = sharp(inputPath)

  let pipeline = image.resize({
    width: config.maxWidth,
    height: config.maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  })

  // Format'a göre output path'i güncelle
  if (config.format === 'webp') {
    pipeline = pipeline.webp({ quality: config.quality })
    outputPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  } else if (config.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: config.quality, progressive: true })
    outputPath = outputPath.replace(/\.(png|webp)$/i, '.jpg')
  } else {
    pipeline = pipeline.png({ quality: config.quality, compressionLevel: 9 })
  }

  await pipeline.toFile(outputPath)
  console.log(`✓ Optimized: ${path.basename(inputPath)} → ${path.basename(outputPath)}`)
}

async function processDirectory(inputDir, outputDir) {
  try {
    const entries = await fs.readdir(inputDir, { withFileTypes: true })

    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name)
      const outputPath = path.join(outputDir, entry.name)

      if (entry.isDirectory()) {
        // Recursive olarak alt dizinleri işle
        await processDirectory(inputPath, outputPath)
      } else if (entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        // Resim dosyasını optimize et
        console.log(`Processing: ${inputPath}`)

        // Output dizinini oluştur
        await fs.mkdir(outputDir, { recursive: true })

        // Category'yi path'ten çıkar ve config'i al
        const category = extractCategory(inputPath)
        const config = category && CONFIG[category] ? CONFIG[category] : DEFAULT_CONFIG

        console.log(`  Category: ${category || 'default'} | Config: ${config.format} @ ${config.quality}%`)

        await optimizeImage(inputPath, outputPath, config)
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error processing ${inputDir}:`, error)
    }
  }
}

;(async () => {
  console.log('🚀 Starting image optimization...')
  console.log('📁 Processing: original/ → optimized/')
  console.log('')
  
  await processDirectory('original', 'optimized')
  
  console.log('')
  console.log('✅ Image optimization completed!')
})()
