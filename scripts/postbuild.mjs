// Cross-platform post-build step: copies .next/static and public/ into the
// standalone output so "npm run build" works identically on Windows, Linux,
// and Render (replaces the Unix-only `cp -r` in the old build script).
import { cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(fileURLToPath(new URL('..', import.meta.url)))
const standalone = join(root, '.next', 'standalone')

const staticSrc = join(root, '.next', 'static')
const staticDest = join(standalone, '.next', 'static')

const publicSrc = join(root, 'public')
const publicDest = join(standalone, 'public')

if (!existsSync(join(standalone, 'server.js'))) {
  console.log('postbuild: standalone output not present (e.g. on Vercel) - skipping copy step')
  process.exit(0)
}

cpSync(staticSrc, staticDest, { recursive: true })
console.log(`postbuild: copied .next/static -> ${staticDest}`)

cpSync(publicSrc, publicDest, { recursive: true })
console.log(`postbuild: copied public -> ${publicDest}`)