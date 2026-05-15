import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("→ Limpando base...");
  await prisma.document.deleteMany();
  await prisma.processTool.deleteMany();
  await prisma.processResponsible.deleteMany();
  await prisma.process.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.responsible.deleteMany();
  await prisma.area.deleteMany();

  console.log("→ Criando áreas...");
  const pessoas = await prisma.area.create({
    data: {
      name: "Pessoas",
      description: "Recursos Humanos, recrutamento, performance e cultura",
      color: "#8B5CF6",
      icon: "Users",
    },
  });
  const tecnologia = await prisma.area.create({
    data: {
      name: "Tecnologia",
      description: "Engenharia de software, infra e dados",
      color: "#06B6D4",
      icon: "Cpu",
    },
  });
  const financeiro = await prisma.area.create({
    data: {
      name: "Financeiro",
      description: "Contas a pagar, receber, contabilidade e fiscal",
      color: "#10B981",
      icon: "DollarSign",
    },
  });
  const comercial = await prisma.area.create({
    data: {
      name: "Comercial",
      description: "Vendas, prospecção e relacionamento com clientes",
      color: "#F59E0B",
      icon: "Briefcase",
    },
  });

  console.log("→ Criando ferramentas...");
  const tools = await Promise.all(
    [
      { name: "Trello", type: "platform", url: "https://trello.com" },
      { name: "Notion", type: "platform", url: "https://notion.so" },
      { name: "Slack", type: "platform", url: "https://slack.com" },
      { name: "GitHub", type: "platform", url: "https://github.com" },
      { name: "Jira", type: "platform", url: "https://atlassian.com/software/jira" },
      { name: "Folha de Pagamento", type: "software" },
      { name: "ERP Totvs", type: "software" },
      { name: "Pipedrive", type: "platform", url: "https://pipedrive.com" },
      { name: "Google Sheets", type: "service", url: "https://sheets.google.com" },
      { name: "AWS", type: "service", url: "https://aws.amazon.com" },
    ].map((t) => prisma.tool.create({ data: t }))
  );
  const tool = (name: string) => tools.find((t) => t.name === name)!;

  console.log("→ Criando responsáveis...");
  const responsibles = await Promise.all(
    [
      { name: "Equipe de Recrutamento", team: "Pessoas", role: "Recrutamento" },
      { name: "Ana Lima", role: "Gerente de RH", team: "Pessoas", email: "ana@empresa.com" },
      { name: "Carlos Souza", role: "Tech Lead", team: "Tecnologia", email: "carlos@empresa.com" },
      { name: "DevOps Squad", team: "Tecnologia", role: "Plataforma" },
      { name: "Marina Pinto", role: "Controller", team: "Financeiro" },
      { name: "Diretoria Comercial", team: "Comercial", role: "Liderança" },
    ].map((r) => prisma.responsible.create({ data: r }))
  );
  const resp = (name: string) => responsibles.find((r) => r.name === name)!;

  console.log("→ Criando processos...");

  // ===== ÁREA PESSOAS =====
  const recrutamento = await prisma.process.create({
    data: {
      name: "Recrutamento e Seleção",
      description: "Ciclo completo de atração e contratação de novos talentos.",
      type: "hybrid",
      status: "active",
      priority: "high",
      order: 0,
      areaId: pessoas.id,
      tools: {
        create: [{ toolId: tool("Trello").id }, { toolId: tool("Notion").id }],
      },
      responsibles: {
        create: [
          { responsibleId: resp("Equipe de Recrutamento").id },
          { responsibleId: resp("Ana Lima").id },
        ],
      },
      documents: {
        create: [
          { title: "Fluxo de recrutamento", type: "wiki", url: "https://notion.so/fluxo" },
          { title: "Guia de entrevista", type: "wiki" },
        ],
      },
    },
  });

  const subRecrut = await Promise.all(
    [
      ["Definição de perfil da vaga", "manual", "high"],
      ["Divulgação da vaga", "system", "medium"],
      ["Triagem de currículos", "hybrid", "high"],
      ["Entrevistas", "manual", "critical"],
      ["Oferta de contratação", "manual", "high"],
    ].map(([name, type, priority], i) =>
      prisma.process.create({
        data: {
          name: name as string,
          type: type as string,
          priority: priority as string,
          order: i,
          areaId: pessoas.id,
          parentId: recrutamento.id,
        },
      })
    )
  );

  // sub-sub: triagem possui etapas
  await prisma.process.createMany({
    data: [
      {
        name: "Triagem automática (ATS)",
        type: "system",
        priority: "medium",
        order: 0,
        areaId: pessoas.id,
        parentId: subRecrut[2].id,
      },
      {
        name: "Triagem manual de finalistas",
        type: "manual",
        priority: "high",
        order: 1,
        areaId: pessoas.id,
        parentId: subRecrut[2].id,
      },
    ],
  });

  // sub-sub: entrevistas
  await prisma.process.createMany({
    data: [
      {
        name: "Entrevista cultural",
        type: "manual",
        priority: "high",
        order: 0,
        areaId: pessoas.id,
        parentId: subRecrut[3].id,
      },
      {
        name: "Entrevista técnica",
        type: "manual",
        priority: "critical",
        order: 1,
        areaId: pessoas.id,
        parentId: subRecrut[3].id,
      },
    ],
  });

  const performance = await prisma.process.create({
    data: {
      name: "Avaliação de Performance",
      description: "Ciclo trimestral de avaliação e feedback de colaboradores.",
      type: "hybrid",
      status: "active",
      priority: "medium",
      order: 1,
      areaId: pessoas.id,
      tools: { create: [{ toolId: tool("Notion").id }, { toolId: tool("Google Sheets").id }] },
      responsibles: { create: [{ responsibleId: resp("Ana Lima").id }] },
    },
  });

  await prisma.process.createMany({
    data: [
      {
        name: "Definição de critérios de avaliação",
        type: "manual",
        priority: "high",
        order: 0,
        areaId: pessoas.id,
        parentId: performance.id,
      },
      {
        name: "Aplicação de avaliações trimestrais",
        type: "system",
        priority: "medium",
        order: 1,
        areaId: pessoas.id,
        parentId: performance.id,
      },
      {
        name: "Feedbacks",
        type: "manual",
        priority: "high",
        order: 2,
        areaId: pessoas.id,
        parentId: performance.id,
      },
    ],
  });

  const desligamento = await prisma.process.create({
    data: {
      name: "Desligamento",
      description: "Processo formal de saída de colaboradores.",
      type: "hybrid",
      status: "active",
      priority: "high",
      order: 2,
      areaId: pessoas.id,
      tools: { create: [{ toolId: tool("Folha de Pagamento").id }, { toolId: tool("Trello").id }] },
    },
  });

  await prisma.process.createMany({
    data: [
      {
        name: "Notificação formal de desligamento",
        type: "manual",
        priority: "high",
        order: 0,
        areaId: pessoas.id,
        parentId: desligamento.id,
      },
      {
        name: "Processamento da rescisão",
        type: "system",
        priority: "critical",
        order: 1,
        areaId: pessoas.id,
        parentId: desligamento.id,
      },
      {
        name: "Devolução de equipamentos",
        type: "manual",
        priority: "medium",
        order: 2,
        areaId: pessoas.id,
        parentId: desligamento.id,
      },
    ],
  });

  // ===== ÁREA TECNOLOGIA =====
  const deploy = await prisma.process.create({
    data: {
      name: "Deploy de Aplicações",
      description: "Pipeline de CI/CD e go-live em produção.",
      type: "system",
      status: "active",
      priority: "critical",
      order: 0,
      areaId: tecnologia.id,
      tools: {
        create: [
          { toolId: tool("GitHub").id },
          { toolId: tool("AWS").id },
          { toolId: tool("Slack").id },
        ],
      },
      responsibles: {
        create: [
          { responsibleId: resp("Carlos Souza").id },
          { responsibleId: resp("DevOps Squad").id },
        ],
      },
      documents: {
        create: [{ title: "Runbook de Deploy", type: "wiki" }],
      },
    },
  });

  await prisma.process.createMany({
    data: [
      {
        name: "Build no CI",
        type: "system",
        priority: "high",
        order: 0,
        areaId: tecnologia.id,
        parentId: deploy.id,
      },
      {
        name: "Testes automatizados",
        type: "system",
        priority: "critical",
        order: 1,
        areaId: tecnologia.id,
        parentId: deploy.id,
      },
      {
        name: "Aprovação manual em staging",
        type: "manual",
        priority: "high",
        order: 2,
        areaId: tecnologia.id,
        parentId: deploy.id,
      },
      {
        name: "Promoção para produção",
        type: "system",
        priority: "critical",
        order: 3,
        areaId: tecnologia.id,
        parentId: deploy.id,
      },
    ],
  });

  const incidente = await prisma.process.create({
    data: {
      name: "Gestão de Incidentes",
      description: "Resposta a falhas em produção e postmortem.",
      type: "hybrid",
      status: "active",
      priority: "critical",
      order: 1,
      areaId: tecnologia.id,
      tools: { create: [{ toolId: tool("Slack").id }, { toolId: tool("Jira").id }] },
      responsibles: { create: [{ responsibleId: resp("DevOps Squad").id }] },
    },
  });

  await prisma.process.createMany({
    data: [
      {
        name: "Detecção via alerta",
        type: "system",
        priority: "critical",
        order: 0,
        areaId: tecnologia.id,
        parentId: incidente.id,
      },
      {
        name: "Triagem e mitigação",
        type: "manual",
        priority: "critical",
        order: 1,
        areaId: tecnologia.id,
        parentId: incidente.id,
      },
      {
        name: "Postmortem",
        type: "manual",
        priority: "medium",
        order: 2,
        areaId: tecnologia.id,
        parentId: incidente.id,
      },
    ],
  });

  // ===== ÁREA FINANCEIRO =====
  const cap = await prisma.process.create({
    data: {
      name: "Contas a Pagar",
      type: "hybrid",
      status: "active",
      priority: "high",
      order: 0,
      areaId: financeiro.id,
      tools: { create: [{ toolId: tool("ERP Totvs").id }] },
      responsibles: { create: [{ responsibleId: resp("Marina Pinto").id }] },
    },
  });
  await prisma.process.createMany({
    data: [
      {
        name: "Recebimento de NF",
        type: "manual",
        order: 0,
        areaId: financeiro.id,
        parentId: cap.id,
      },
      {
        name: "Lançamento no ERP",
        type: "system",
        order: 1,
        areaId: financeiro.id,
        parentId: cap.id,
      },
      {
        name: "Aprovação por gestor",
        type: "manual",
        order: 2,
        areaId: financeiro.id,
        parentId: cap.id,
      },
      {
        name: "Pagamento e baixa",
        type: "system",
        order: 3,
        areaId: financeiro.id,
        parentId: cap.id,
      },
    ],
  });

  // ===== ÁREA COMERCIAL =====
  const vendas = await prisma.process.create({
    data: {
      name: "Funil de Vendas B2B",
      type: "hybrid",
      status: "active",
      priority: "critical",
      order: 0,
      areaId: comercial.id,
      tools: { create: [{ toolId: tool("Pipedrive").id }, { toolId: tool("Slack").id }] },
      responsibles: { create: [{ responsibleId: resp("Diretoria Comercial").id }] },
    },
  });
  await prisma.process.createMany({
    data: [
      {
        name: "Prospecção",
        type: "manual",
        order: 0,
        areaId: comercial.id,
        parentId: vendas.id,
      },
      {
        name: "Qualificação",
        type: "hybrid",
        order: 1,
        areaId: comercial.id,
        parentId: vendas.id,
      },
      {
        name: "Proposta comercial",
        type: "manual",
        order: 2,
        areaId: comercial.id,
        parentId: vendas.id,
      },
      {
        name: "Fechamento",
        type: "manual",
        priority: "critical",
        order: 3,
        areaId: comercial.id,
        parentId: vendas.id,
      },
    ],
  });

  const counts = await Promise.all([
    prisma.area.count(),
    prisma.process.count(),
    prisma.tool.count(),
    prisma.responsible.count(),
  ]);
  console.log(`✔ Seed concluído: ${counts[0]} áreas, ${counts[1]} processos, ${counts[2]} ferramentas, ${counts[3]} responsáveis`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
