import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Termos de Uso do aplicativo Confraria, incluindo assinatura VIP.",
  title: "Termos de Uso | Confraria",
};

const sections = [
  {
    title: "1. Aceitação",
    body: `Ao acessar ou usar o aplicativo Confraria, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço.`,
  },
  {
    title: "2. Conta e elegibilidade",
    body: `Você é responsável por manter a confidencialidade da sua conta e por todas as atividades realizadas nela. O uso do app deve observar a legislação aplicável e as regras da comunidade.`,
  },
  {
    title: "3. Assinatura VIP (auto-renovável)",
    body: `O Confraria pode oferecer assinatura VIP com planos mensal e anual.
• O pagamento é cobrado na Conta Apple no momento da confirmação da compra.
• A assinatura é renovada automaticamente, salvo se cancelada pelo menos 24 horas antes do fim do período vigente.
• A Conta Apple será cobrada pela renovação nas 24 horas anteriores ao fim do período atual.
• Você pode gerenciar e cancelar a assinatura em Ajustes → Conta Apple → Assinaturas.
• Qualquer parte não utilizada de um período de avaliação gratuita, se oferecida, será perdida quando o usuário adquirir uma assinatura.`,
  },
  {
    title: "4. Conteúdo do usuário",
    body: `Você mantém a titularidade do conteúdo que publica, mas concede ao Confraria licença para exibi-lo e operá-lo dentro do serviço. Conteúdo ilícito, ofensivo ou que viole direitos de terceiros pode ser removido.`,
  },
  {
    title: "5. Limitação de responsabilidade",
    body: `O Confraria é fornecido “como está”. Na máxima extensão permitida por lei, não nos responsabilizamos por danos indiretos, lucros cessantes ou indisponibilidades temporárias do serviço.`,
  },
  {
    title: "6. Privacidade",
    body: `O tratamento de dados pessoais é descrito na Política de Privacidade disponível em /politica-de-privacidade.`,
  },
  {
    title: "7. Alterações",
    body: `Podemos atualizar estes Termos periodicamente. A versão vigente estará disponível nesta página. O uso contínuo após alterações constitui aceitação da nova versão.`,
  },
  {
    title: "8. Contato",
    body: `Dúvidas sobre estes Termos: privacidade@confraria.app`,
  },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-brand-gray px-4 py-10 text-brand-dark">
      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-panel p-6 shadow-sm sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-primary">
          Confraria
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
        <p className="mt-3 text-sm text-muted">
          Última atualização: 9 de setembro de 2026
        </p>
        <p className="mt-6 leading-relaxed text-brand-dark/90">
          Estes Termos regem o uso do aplicativo Confraria e dos recursos de
          assinatura VIP.
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
          Política de Privacidade:{" "}
          <a
            className="font-medium text-brand-primary underline-offset-2 hover:underline"
            href="/politica-de-privacidade"
          >
            /politica-de-privacidade
          </a>
        </p>
      </article>
    </main>
  );
}
