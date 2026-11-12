/**
 * Run a Python script with whichever interpreter this machine actually has.
 * Vercel and other Linux hosts expose `python3`. Windows often only has the
 * `py` launcher; the `python3` store alias exits before it can run a file.
 */
const { spawnSync } = require('child_process')

const script = process.argv[2]
if (!script) {
  console.error('usage: node tools/run-py.js <script.py>')
  process.exit(1)
}

const tries =
  process.platform === 'win32'
    ? [
        ['py', ['-3', script]],
        ['python', [script]],
        ['python3', [script]],
      ]
    : [
        ['python3', [script]],
        ['python', [script]],
      ]

let last = 1
for (const [cmd, args] of tries) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' })
  if (result.error && result.error.code === 'ENOENT') continue
  if (result.status === 0) process.exit(0)
  last = result.status == null ? 1 : result.status
}
process.exit(last)
