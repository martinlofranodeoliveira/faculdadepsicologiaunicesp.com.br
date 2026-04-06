export type InstitutionContractType = 'graduation' | 'pos'

export type InstitutionContractPayload = {
  title: string
  html: string
  text: string
}

type ContractResponse = {
  data?: InstitutionContractPayload
  message?: string
}

export async function fetchInstitutionContract(
  type: InstitutionContractType,
): Promise<InstitutionContractPayload> {
  const response = await fetch(`/api/institution-contract?type=${type}`)
  const payload = (await response.json().catch(() => null)) as ContractResponse | null

  if (!response.ok || !payload?.data) {
    throw new Error(
      payload?.message || 'Não foi possível carregar o contrato agora. Tente novamente em instantes.',
    )
  }

  return payload.data
}
