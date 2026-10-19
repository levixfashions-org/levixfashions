import { execSync } from 'child_process'

const GIT_CMD = 'C:\\Program Files\\Git\\cmd\\git.exe'
const CHECK_INTERVAL_MS = 10000 // checks every 10 seconds

function runGit(args) {
  try {
    return execSync(`"${GIT_CMD}" ${args}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    }).trim()
  } catch (err) {
    throw new Error(err.stderr ? err.stderr.trim() : err.message)
  }
}

let isSyncing = false

async function checkAndSync() {
  if (isSyncing) return

  try {
    const status = runGit('status --porcelain')
    if (!status) return // No changes

    isSyncing = true
    const changedFiles = status
      .split('\n')
      .map((l) => l.replace(/^..\s*/, '').trim())
      .filter(Boolean)

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    console.log(`\n⚡ [Auto-Sync] Detected ${changedFiles.length} change(s) at ${timestamp}:`)
    changedFiles.slice(0, 5).forEach((f) => console.log(`   • ${f}`))
    if (changedFiles.length > 5) console.log(`   ...and ${changedFiles.length - 5} more`)

    // Rebuild production dist assets if source files changed
    const shouldRebuild = changedFiles.some((f) => 
      f.startsWith('src/') || 
      f.startsWith('public/') || 
      f.endsWith('.html') || 
      f.endsWith('.json') || 
      f.endsWith('.ts') || 
      f.endsWith('.tsx') ||
      f.endsWith('.css')
    )
    if (shouldRebuild) {
      console.log('📦 [Auto-Sync] Building production dist bundle for Hostinger...')
      try {
        execSync('npm run build', { stdio: 'pipe', cwd: process.cwd() })
        console.log('✔ [Auto-Sync] Production dist bundle compiled successfully!')
      } catch (buildErr) {
        console.warn('⚠️ [Auto-Sync] Build note:', buildErr.message)
      }
    }

    // Stage all changes (including dist)
    runGit('add -A')

    // Commit
    const commitMsg = `auto-sync: updates at ${timestamp}`
    runGit(`commit -m "${commitMsg}"`)
    console.log(`✔ [Auto-Sync] Committed: "${commitMsg}"`)

    // Push to GitHub
    console.log(`🚀 [Auto-Sync] Pushing to GitHub...`)
    runGit('push origin main')
    console.log(`✅ [Auto-Sync] Live updates pushed successfully to GitHub!\n`)
  } catch (err) {
    console.warn(`⚠️ [Auto-Sync] Notice: ${err.message}`)
  } finally {
    isSyncing = false
  }
}

console.log('====================================================')
console.log('  LEVIX Live GitHub Auto-Sync Service Active')
console.log('  Watching for changes every 10 seconds...')
console.log('  Repository: https://github.com/levixfashions-org/levixfashions.git')
console.log('====================================================\n')

// Initial check
checkAndSync()

// Loop interval
setInterval(checkAndSync, CHECK_INTERVAL_MS)
