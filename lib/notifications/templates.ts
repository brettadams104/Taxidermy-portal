export interface TemplateVars {
  name: string | undefined
  points: string | undefined
  dnr_tag: string | undefined
  business_name: string
}

export function renderTemplate(template: string, vars: TemplateVars): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (!(key in vars)) return match
    return vars[key as keyof TemplateVars] ?? ''
  })
}

export function buildTemplateVars(
  clientName: string | null,
  points: number | null,
  dnrTag: string | null,
  businessName: string
): TemplateVars {
  return {
    name: clientName ?? undefined,
    points: points != null ? String(points) : undefined,
    dnr_tag: dnrTag ?? undefined,
    business_name: businessName,
  }
}
