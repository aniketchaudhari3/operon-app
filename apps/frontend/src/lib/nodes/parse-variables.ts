const VAR_REGEX = /\{\{\s*([A-Za-z_$][\w$]*)\s*\}\}/g

export function parseVariables(text: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  let match: RegExpExecArray | null

  while ((match = VAR_REGEX.exec(text)) !== null) {
    const name = match[1]
    if (!seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }

  return result
}
