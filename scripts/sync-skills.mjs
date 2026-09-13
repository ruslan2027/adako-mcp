#!/usr/bin/env node
// @ts-check
/**
 * Copy the skill sources into the public repository.
 *
 * Source of truth: `packages/skills/<name>/SKILL.md` (plus any `references/`).
 * Destinations, all generated:
 *
 *   public-repo/skills/<name>/        what people copy into ~/.claude/skills or upload to claude.ai
 *   public-repo/plugin/skills/<name>/ the copy the Claude Code plugin ships
 *   public-repo/SKILL.md              the root skill, for clients that take a single file
 *
 * Zero dependencies. Node 22+.
 *
 *   node public-repo/scripts/sync-skills.mjs
 */
import { cp, mkdir, readdir, rm, stat, writeFile, readFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const publicRepo = resolve(here, '..')
const repoRoot = resolve(publicRepo, '..')
const source = join(repoRoot, 'packages', 'skills')

/** The skill whose SKILL.md is also published at the root of the public repo. */
const ROOT_SKILL = 'adako'

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

/** Every directory under `packages/skills` that holds a SKILL.md, sorted by name. */
async function listSkills() {
  const entries = await readdir(source, { withFileTypes: true })
  const names = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (await isFile(join(source, entry.name, 'SKILL.md'))) names.push(entry.name)
  }
  return names.sort()
}

/** Frontmatter `name:` must match the directory, or a client loads the skill under the wrong name. */
async function checkFrontmatter(name) {
  const text = await readFile(join(source, name, 'SKILL.md'), 'utf8')
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error(`${name}/SKILL.md has no frontmatter block`)
  const declared = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
  if (declared !== name) {
    throw new Error(
      `${name}/SKILL.md declares name: ${declared ?? '(none)'} — it must match the directory`,
    )
  }
}

export async function syncSkills() {
  if (!(await isDirectory(source))) {
    throw new Error(`No skill sources at ${source}. Run this from the Adako monorepo.`)
  }
  const names = await listSkills()
  if (names.length === 0) throw new Error(`No SKILL.md found under ${source}`)
  for (const name of names) await checkFrontmatter(name)

  const targets = [join(publicRepo, 'skills'), join(publicRepo, 'plugin', 'skills')]
  const written = []

  for (const target of targets) {
    await rm(target, { recursive: true, force: true })
    await mkdir(target, { recursive: true })
    for (const name of names) {
      await cp(join(source, name), join(target, name), { recursive: true })
    }
    written.push(`${relative(publicRepo, target).replace(/\\/g, '/')}/ (${names.length} skills)`)
  }

  const root = join(publicRepo, 'SKILL.md')
  await writeFile(root, await readFile(join(source, ROOT_SKILL, 'SKILL.md')))
  written.push('SKILL.md')

  return { names, written }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1] === fileURLToPath(import.meta.url)
) {
  const { names, written } = await syncSkills()
  console.log(`synced ${names.length} skills: ${names.join(', ')}`)
  for (const line of written) console.log(`  ${line}`)
}
