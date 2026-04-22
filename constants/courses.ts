// Course data — placeholder until connected to a database.
// All course-scoped screens (exams, exercises, summaries, tips) filter
// their content by courseId when the real API is wired up.

export type Material = {
  id: string;
  title: string;
  type: 'exam' | 'exercise' | 'summary' | 'notes';
  subtitle?: string;
  rating?: number;
  pdf?: string;
};

export type ThreadReply = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  author: string;
  body: string;
  createdAt: string;
  replyCount: number;
  replies: ThreadReply[];
};

export type Course = {
  id: string;
  name: string;
  code: string;
  materials: Material[];
  threads: Thread[];
};

const THREADS_ESOF: Thread[] = [
  {
    id: 't1', title: 'Dúvida sobre User Stories', author: 'joao.silva',
    body: 'Alguém pode explicar a diferença entre uma User Story e um Use Case? Estou a confundir os dois para o projeto.',
    createdAt: '2025-04-10', replyCount: 3,
    replies: [
      { id: 'r1', author: 'ana.costa',   body: 'User Stories são mais informais e centradas no utilizador. Use Cases descrevem interações detalhadas com o sistema.', createdAt: '2025-04-10' },
      { id: 'r2', author: 'pedro.m',     body: 'O prof. Faria explicou bem na aula 4 — vê os slides!', createdAt: '2025-04-11' },
      { id: 'r3', author: 'joao.silva',  body: 'Obrigado, já percebi!', createdAt: '2025-04-11' },
    ],
  },
  {
    id: 't2', title: 'Grupo para o projeto — procuro 2 elementos', author: 'maria.f',
    body: 'Olá, ainda estou à procura de grupo para o projeto. Tenho experiência com React Native. Alguém precisa de mais um membro?',
    createdAt: '2025-04-09', replyCount: 1,
    replies: [
      { id: 'r1', author: 'rui.b', body: 'Entra no nosso grupo! Somos 3 e precisamos de mais um. Envia-me mensagem.', createdAt: '2025-04-09' },
    ],
  },
  {
    id: 't3', title: 'Como correr os testes de aceitação?', author: 'tiago.r',
    body: 'Não consigo configurar o Cucumber no projeto. Alguém já conseguiu?',
    createdAt: '2025-04-08', replyCount: 0,
    replies: [],
  },
];

const THREADS_FIS: Thread[] = [
  {
    id: 't1', title: 'Fórmula para campo elétrico de um dipolo', author: 'carlos.m',
    body: 'Qual é a fórmula exata para o campo elétrico de um dipolo no eixo de simetria? O livro tem duas versões diferentes.',
    createdAt: '2025-04-09', replyCount: 2,
    replies: [
      { id: 'r1', author: 'inês.l',  body: 'E = 2kp/r³ para o eixo do dipolo. Verifica a página 112 do Serway.', createdAt: '2025-04-09' },
      { id: 'r2', author: 'carlos.m', body: 'Encontrei, obrigado!', createdAt: '2025-04-10' },
    ],
  },
  {
    id: 't2', title: 'Dúvida no problema 5 da ficha 3', author: 'beatriz.n',
    body: 'No problema 5 da ficha 3, não percebo porque o ângulo é 30° e não 60°. Alguém pode explicar?',
    createdAt: '2025-04-07', replyCount: 0,
    replies: [],
  },
];

const THREADS_GENERIC: Thread[] = [
  {
    id: 't1', title: 'Dúvida sobre o exame', author: 'aluno.anon',
    body: 'O exame vai ter consulta ou é fechado? Não encontro essa informação no moodle.',
    createdAt: '2025-04-08', replyCount: 1,
    replies: [
      { id: 'r1', author: 'monitor.1', body: 'É sem consulta. Podem levar uma folha A4 escrita dos dois lados.', createdAt: '2025-04-08' },
    ],
  },
];

export const COURSES: Record<string, Course> = {
  'c1000000-0000-0000-0000-000000000001': {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Engenharia de Software',
    code: 'ES',
    threads: THREADS_ESOF,
    materials: [
      { id: 'm1', title: 'Lecture Notes — Agile Methods', type: 'summary',  subtitle: '12 páginas',          rating: 4 },
      { id: 'm2', title: 'Exam 2024/2025',                type: 'exam',   subtitle: 'Part 1 · 10 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Exercise Sheet 1',               type: 'exercise',   subtitle: 'Fundamentos · 8 páginas', rating: 3 },
      { id: 'm4', title: 'Dicas para o exam',             type: 'notes',    subtitle: 'summary de pontos-chave' },
    ],
  },
  'c1000000-0000-0000-0000-000000000003': {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Laboratório de Computadores',
    code: 'LCOM',
    threads: THREADS_FIS,
    materials: [
      { id: 'm1', title: 'Guia Projeto', type: 'summary', subtitle: '8 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2023/2024',           type: 'exam',  subtitle: 'Part 1 · 12 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Dicas de I/O',         type: 'notes',   subtitle: 'Métodos úteis' },
    ],
  },
  'c1000000-0000-0000-0000-000000000005': {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Sistemas Operativos',
    code: 'SO',
    threads: THREADS_GENERIC,
    materials: [
      { id: 'm1', title: 'Processos — Resumo', type: 'summary', subtitle: '6 páginas', rating: 4 },
      { id: 'm2', title: 'Exame 2023/2024',        type: 'exam',  subtitle: '10 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Ficha de Exercícios 1',  type: 'exercise',  subtitle: 'Comunicação entre processos · 5 páginas', rating: 3 },
    ],
  },
  'c1000000-0000-0000-0000-000000000006': {
    id: 'c1000000-0000-0000-0000-000000000006',
    name: 'Programação',
    code: 'PROG',
    threads: THREADS_GENERIC,
    materials: [
      { id: 'm1', title: 'Sorting Algorithms Cheatsheet', type: 'summary', subtitle: '4 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2024/2025',                type: 'exam',  subtitle: 'Part 1 · 8 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'exercise 1 — Arrays',              type: 'exercise',  subtitle: 'Básico · 6 páginas', rating: 3 },
      { id: 'm4', title: 'Truques de Debugging',           type: 'notes',   subtitle: 'Pontos-chave' },
    ],
  },
  'c1000000-0000-0000-0000-000000000004': {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Algoritmos e Estruturas de Dados',
    code: 'AED',
    threads: THREADS_GENERIC,
    materials: [
      { id: 'm1', title: 'Complexidade — summary', type: 'summary', subtitle: '5 páginas', rating: 4 },
      { id: 'm2', title: 'Exam 2023/2024',         type: 'exam',  subtitle: '10 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'exercise — Grafos',          type: 'exercise',  subtitle: 'Avançado · 8 páginas', rating: 3 },
    ],
  },
  'c1000000-0000-0000-0000-000000000002': {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Bases de Dados',
    code: 'BD',
    threads: THREADS_GENERIC,
    materials: [
      { id: 'm1', title: 'ER Diagram Guide', type: 'summary', subtitle: '6 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2023/2024',   type: 'exam',  subtitle: '10 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'exercise — SQL',       type: 'exercise',  subtitle: 'Queries · 7 páginas', rating: 4 },
    ],
  },
};
