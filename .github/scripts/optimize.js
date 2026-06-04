const sharp = require('sharp')
const fs = require('fs').promises
const path = require('path')

const CATEGORIES = ['firms/logos', 'users/profiles', 'appointments/photos']

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

async function optimizeImage(inputPath, outputPath, config) {
  const image = sharp(inputPath)
  const metadata = await image.metadata()

  let pipeline = image.resize({
    width: config.maxWidth,
    height: config.maxHeight,
    fit: 'inside',
    withoutEnlargement: true,
  })

  if (config.format === 'webp') {
    pipeline = pipeline.webp({ quality: config.quality })
    outputPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  } else if (config.format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: config.quality, progressive: true })
  } else {
    pipeline = pipeline.png({ quality: config.quality, compressionLevel: 9 })
  }

  await pipeline.toFile(outputPath)
  console.log(`✓ Optimized: ${path.basename(inputPath)} → ${path.basename(outputPath)}`)
}

async function processCategory(category) {
  const originalDir = path.join('original', category)
  const optimizedDir = path.join('optimized', category)

  try {
    await fs.mkdir(optimizedDir, { recursive: true })
    const files = await fs.readdir(originalDir)

    for (const file of files) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue

      const inputPath = path.join(originalDir, file)
      const outputPath = path.join(optimizedDir, file)
      const config = CONFIG[category]

      await optimizeImage(inputPath, outputPath, config)
    }
  } catch (error) {
    console.error(`Error processing ${category}:`, error)
  }
}

;(async () => {
  console.log('Starting image optimization...')
  for (const category of CATEGORIES) {
    await processCategory(category)
  }
  console.log('Image optimization completed!')
})()
