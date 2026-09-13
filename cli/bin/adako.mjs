#!/usr/bin/env node
// @ts-check
import { main } from '../src/cli.mjs'

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code
  },
  (error) => {
    process.stderr.write(`Error: ${String(error)}\n`)
    process.exitCode = 1
  },
)
