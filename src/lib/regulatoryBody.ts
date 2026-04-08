import { normalizeComparableText } from './courseRoutes'

const KNOWN_REGULATORY_BODY_LABELS: Array<{ label: string; terms: string[] }> = [
  { label: 'CRP', terms: ['crp', 'conselho regional de psicologia'] },
  { label: 'CFP', terms: ['cfp', 'conselho federal de psicologia'] },
  { label: 'COREN', terms: ['coren', 'conselho regional de enfermagem'] },
  { label: 'COFEN', terms: ['cofen', 'conselho federal de enfermagem'] },
  { label: 'CRM', terms: ['crm', 'conselho regional de medicina'] },
  { label: 'CFM', terms: ['cfm', 'conselho federal de medicina'] },
  { label: 'CRO', terms: ['cro', 'conselho regional de odontologia'] },
  { label: 'CFO', terms: ['cfo', 'conselho federal de odontologia'] },
  { label: 'CRF', terms: ['crf', 'conselho regional de farmacia'] },
  { label: 'CFF', terms: ['cff', 'conselho federal de farmacia'] },
  { label: 'CRN', terms: ['crn', 'conselho regional de nutricao'] },
  { label: 'CFN', terms: ['cfn', 'conselho federal de nutricao'] },
  { label: 'CREFITO', terms: ['crefito', 'conselho regional de fisioterapia'] },
  { label: 'COFFITO', terms: ['coffito', 'conselho federal de fisioterapia'] },
  { label: 'CREF', terms: ['cref', 'conselho regional de educacao fisica'] },
  { label: 'CONFEF', terms: ['confef', 'conselho federal de educacao fisica'] },
  { label: 'CRESS', terms: ['cress', 'conselho regional de servico social'] },
  { label: 'CFESS', terms: ['cfess', 'conselho federal de servico social'] },
  { label: 'OAB', terms: ['oab', 'ordem dos advogados do brasil'] },
]

function normalizeRegulatoryBodyText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function matchKnownRegulatoryBodyLabel(value: string): string {
  const normalized = normalizeComparableText(value)
  if (!normalized) return ''

  for (const entry of KNOWN_REGULATORY_BODY_LABELS) {
    if (entry.terms.some((term) => normalized.includes(term))) {
      return entry.label
    }
  }

  return ''
}

function extractExplicitRegulatoryBodyLabel(value: string): string {
  const normalized = normalizeRegulatoryBodyText(value)
  if (!normalized) return ''

  const candidates = [
    normalized.match(/\(([^)]+)\)/u)?.[1] ?? '',
    normalized.match(/^([A-Za-z][A-Za-z0-9/-]{1,9})\s*[-–:]\s+/u)?.[1] ?? '',
    normalized.match(/\s[-–:]\s*([A-Za-z][A-Za-z0-9/-]{1,9})$/u)?.[1] ?? '',
    normalized,
  ]

  for (const candidate of candidates) {
    const trimmedCandidate = candidate.trim()
    if (!trimmedCandidate) continue
    if (/^(?:c[a-z0-9/-]{1,9}|oab)$/iu.test(trimmedCandidate)) {
      return trimmedCandidate.toUpperCase()
    }
  }

  return ''
}

export function resolveRegulatoryBodyDisplayLabel(
  regulatoryBodyName: string | null | undefined,
  regulatoryBodyComplement?: string | null,
): string {
  const normalizedName = normalizeRegulatoryBodyText(regulatoryBodyName)
  const normalizedComplement = normalizeRegulatoryBodyText(regulatoryBodyComplement)

  return (
    matchKnownRegulatoryBodyLabel(normalizedComplement) ||
    matchKnownRegulatoryBodyLabel(normalizedName) ||
    extractExplicitRegulatoryBodyLabel(normalizedComplement) ||
    extractExplicitRegulatoryBodyLabel(normalizedName) ||
    normalizedName
  )
}

export function resolveRegulatoryBodySupportingText(
  regulatoryBodyName: string | null | undefined,
  regulatoryBodyComplement?: string | null,
  displayLabel?: string,
): string {
  const normalizedName = normalizeRegulatoryBodyText(regulatoryBodyName)
  const normalizedComplement = normalizeRegulatoryBodyText(regulatoryBodyComplement)
  const normalizedDisplayLabel = normalizeComparableText(displayLabel ?? '')

  for (const candidate of [normalizedComplement, normalizedName]) {
    if (!candidate) continue
    if (normalizeComparableText(candidate) === normalizedDisplayLabel) continue
    return candidate
  }

  return ''
}
