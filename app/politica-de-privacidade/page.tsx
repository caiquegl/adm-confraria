import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Política de Privacidade e Proteção de Dados do aplicativo Confraria.",
  title: "Política de Privacidade | Confraria",
};

const sections = [
  {
    title: "1. Dados coletados",
    body: `Coletamos informações fornecidas por você no cadastro e uso do aplicativo, como nome, e-mail, preferências de motociclismo, dados de perfil, localização (quando autorizada), conteúdo que você publica e demais dados necessários para personalizar e operar a experiência no Confraria.`,
  },
  {
    title: "2. Finalidade do tratamento",
    body: `Seus dados são utilizados para:
• criar e gerenciar sua conta;
• personalizar eventos, rotas e conteúdos do app;
• processar assinaturas VIP e pagamentos (incluindo Apple In-App Purchase e demais provedores de pagamento, conforme a plataforma);
• enviar comunicações relevantes sobre a plataforma;
• cumprir obrigações legais e regulatórias;
• prevenir fraudes e garantir a segurança do serviço.`,
  },
  {
    title: "3. Compartilhamento",
    body: `Não vendemos seus dados. O compartilhamento ocorre apenas quando necessário para operação do serviço (por exemplo, provedores de infraestrutura, autenticação, mapas, analytics e processamento de pagamentos/assinaturas), cumprimento legal ou com seu consentimento.`,
  },
  {
    title: "4. Armazenamento e segurança",
    body: `Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perda ou alteração indevida. Os dados podem ser processados em servidores na nuvem, inclusive fora do Brasil, com salvaguardas adequadas.`,
  },
  {
    title: "5. Assinaturas e compras",
    body: `Quando você assina o Confraria VIP pela App Store, o pagamento é processado pela Apple. Recebemos da Apple informações necessárias para validar e ativar sua assinatura (como identificadores de transação e status da assinatura), sem acesso aos dados completos do seu cartão.`,
  },
  {
    title: "6. Seus direitos",
    body: `Você pode solicitar acesso, correção, exclusão, portabilidade ou revogação do consentimento entrando em contato pelo e-mail: privacidade@confraria.app`,
  },
  {
    title: "7. Retenção",
    body: `Mantemos seus dados enquanto sua conta estiver ativa ou conforme exigido por lei, inclusive prazos relacionados a obrigações fiscais e de assinatura.`,
  },
  {
    title: "8. Alterações",
    body: `Esta política pode ser atualizada. A versão vigente estará sempre disponível nesta página e no aplicativo.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-brand-gray px-4 py-10 text-brand-dark">
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-panel p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-primary">
          Confraria
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted">
          Última atualização: 9 de setembro de 2026
        </p>
        <p className="mt-6 leading-relaxed text-brand-dark/90">
          Esta Política descreve como o aplicativo Confraria coleta, utiliza,
          armazena e protege seus dados pessoais, em conformidade com a Lei
          Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-brand-dark/90">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm leading-relaxed text-muted">
          Contato:{" "}
          <a
            className="font-medium text-brand-primary underline-offset-2 hover:underline"
            href="mailto:privacidade@confraria.app"
          >
            privacidade@confraria.app
          </a>
        </p>
      </article>
    </main>
  );
}
