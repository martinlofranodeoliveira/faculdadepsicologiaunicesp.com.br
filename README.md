# faculdadepsicologiaunicesp.com.br

Migração da antiga landing page para uma estrutura de site em `Astro + React`, inspirada na arquitetura de navegação da `faculdadepaulista.com.br`, mas com componentes, layout e conteúdo próprios.

## Stack

- Astro 6
- React 19
- TypeScript
- Tailwind CSS
- ESLint

## Como rodar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Estrutura principal

- `src/pages`: rotas Astro do site.
- `src/home`: home e camada de dados da página inicial.
- `src/course`: categoria de pós, página de curso e explorador.
- `src/lead`: formulários reutilizáveis.
- `src/vestibular`: fluxo de vestibular da graduação.
- `src/lib`: catálogo, CRM, jornada e sitemap.
- `src/site`: configuração global e fallback do catálogo.
- `src/legal`: conteúdo e componente das páginas legais.

## Observações

- A graduação foi mantida como rota direta para o curso principal, sem categoria própria.
- A categoria de pós e as páginas de curso já estão preparadas para consumir dados da API pública.
- Quando a API não estiver configurada, o projeto usa fallback local para não quebrar a build nem o ambiente de desenvolvimento.
