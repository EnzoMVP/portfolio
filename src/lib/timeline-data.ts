// Localized side by side, same `{ en, ptBR }` shape the Sanity locale types
// use, so `pickLocale()` resolves these too.
export type LocalizedText = { en: string; ptBR: string };

/** "YYYY-MM" — month precision is all the timeline displays. */
export type YearMonth = `${number}-${number}${number}`;

/**
 * 1 = minor, 2 = regular, 3 = highlight. Drives how prominent the card and
 * its node on the axis are, not where it sits — position comes from dates.
 */
export type Importance = 1 | 2 | 3;

type TimelineEventBase = {
  /** Stable, unique key. */
  id: string;
  importance: Importance;
  start: YearMonth;
  /** `null` while still ongoing — runs up to the present. */
  end: YearMonth | null;
};

// One variant per topic. Each topic renders its own card component
// (`src/components/timeline/cards/`), so a topic's fields can diverge freely
// from the others' — add a new variant here plus a card for it.
export type GraduationEvent = TimelineEventBase & {
  topic: "graduation";
  degree: LocalizedText;
  institution: string;
  /** Expected graduation month, shown while the degree is still ongoing. */
  expectedEnd?: YearMonth;
};

export type CourseEvent = TimelineEventBase & {
  topic: "course";
  title: LocalizedText;
  provider: string;
  /** What the course taught — a sentence or two. */
  learned: LocalizedText;
  repositoryUrl?: string;
  certificateUrl?: string;
  /** Shown in the certificate link's place when there's no URL to link to. */
  certificateNote?: LocalizedText;
};

export type TimelineEvent = GraduationEvent | CourseEvent;
export type TimelineTopic = TimelineEvent["topic"];

// Order in this array doesn't matter — the layout sorts by date. The side of
// the axis comes from the topic (`SIDE_BY_TOPIC` in `timeline-layout.ts`).
export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "uff-computer-science",
    topic: "graduation",
    importance: 3,
    start: "2026-03",
    end: null,
    degree: { en: "B.Sc. in Computer Science", ptBR: "Bacharelado em Ciência da Computação" },
    institution: "Universidade Federal Fluminense (UFF)",
    expectedEnd: "2029-12",
  },
  {
    id: "harvard-cs50-ai",
    topic: "course",
    importance: 2,
    start: "2026-07",
    end: "2026-09",
    title: { en: "CS50 AI", ptBR: "CS50 AI" },
    provider: "Harvard University",
    // Summarized from the repository README.
    learned: {
      en: "Foundations of AI with Python, from search, logic and probabilistic reasoning to machine learning, neural networks and NLP with Transformers — all 12 projects completed, from a Minimax Tic-Tac-Toe player to a traffic-sign CNN and an analysis of BERT's attention heads.",
      ptBR: "Fundamentos de IA com Python, de busca, lógica e raciocínio probabilístico a machine learning, redes neurais e NLP com Transformers — os 12 projetos concluídos, de um jogador de Jogo da Velha com Minimax a uma CNN de placas de trânsito e uma análise das cabeças de atenção do BERT.",
    },
    repositoryUrl: "https://github.com/EnzoMVP/Harvard-CS50-AI",
    certificateUrl: "https://certificates.cs50.io/67702f70-2387-4a2a-b9a5-563679ba052d.pdf",
  },
];
