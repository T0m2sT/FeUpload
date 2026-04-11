// Course data — placeholder until connected to a database.
// All course-scoped screens (exams, exercises, summaries, tips) filter
// their content by courseId when the real API is wired up.

export type Material = {
  id: string;
  title: string;
  type: 'Exame' | 'Ficha' | 'Resumo' | 'Dica';
  subtitle?: string;
  rating?: number;
  pdf?: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  materials: Material[];
};

export const COURSES: Record<string, Course> = {
  '1': {
    id: '1',
    name: 'Engenharia de Software',
    code: 'ESOF',
    materials: [
      { id: 'm1', title: 'Lecture Notes — Agile Methods', type: 'Resumo',  subtitle: '12 páginas',          rating: 4 },
      { id: 'm2', title: 'Exam 2024/2025',                type: 'Exame',   subtitle: 'Part 1 · 10 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Exercise Sheet 1',               type: 'Ficha',   subtitle: 'Fundamentos · 8 páginas', rating: 3 },
      { id: 'm4', title: 'Dicas para o Exame',             type: 'Dica',    subtitle: 'Resumo de pontos-chave' },
    ],
  },
  '2': {
    id: '2',
    name: 'Física',
    code: 'FIS',
    materials: [
      { id: 'm1', title: 'Guia de Eletromagnetismo', type: 'Resumo', subtitle: '8 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2023/2024',           type: 'Exame',  subtitle: 'Part 1 · 12 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Dicas de Mecânica',         type: 'Dica',   subtitle: 'Fórmulas essenciais' },
    ],
  },
  '3': {
    id: '3',
    name: 'Economia',
    code: 'ECO',
    materials: [
      { id: 'm1', title: 'Microeconomia — Resumo', type: 'Resumo', subtitle: '6 páginas', rating: 4 },
      { id: 'm2', title: 'Exame 2023/2024',        type: 'Exame',  subtitle: '10 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Ficha de Exercícios 1',  type: 'Ficha',  subtitle: 'Oferta e Procura · 5 páginas', rating: 3 },
    ],
  },
  '4': {
    id: '4',
    name: 'Programação',
    code: 'PROG',
    materials: [
      { id: 'm1', title: 'Sorting Algorithms Cheatsheet', type: 'Resumo', subtitle: '4 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2024/2025',                type: 'Exame',  subtitle: 'Part 1 · 8 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Ficha 1 — Arrays',              type: 'Ficha',  subtitle: 'Básico · 6 páginas', rating: 3 },
      { id: 'm4', title: 'Truques de Debugging',           type: 'Dica',   subtitle: 'Pontos-chave' },
    ],
  },
  '5': {
    id: '5',
    name: 'Algoritmos e Estruturas de Dados',
    code: 'AED',
    materials: [
      { id: 'm1', title: 'Complexidade — Resumo', type: 'Resumo', subtitle: '5 páginas', rating: 4 },
      { id: 'm2', title: 'Exam 2023/2024',         type: 'Exame',  subtitle: '10 páginas', rating: 4, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Ficha — Grafos',          type: 'Ficha',  subtitle: 'Avançado · 8 páginas', rating: 3 },
    ],
  },
  '6': {
    id: '6',
    name: 'Bases de Dados',
    code: 'BD',
    materials: [
      { id: 'm1', title: 'ER Diagram Guide', type: 'Resumo', subtitle: '6 páginas', rating: 5 },
      { id: 'm2', title: 'Exam 2023/2024',   type: 'Exame',  subtitle: '10 páginas', rating: 3, pdf: 'https://drive.google.com/file/d/1XfxtcV_zh89cpgwXlahnkjSgzXzZ_kRz/view?usp=drive_link' },
      { id: 'm3', title: 'Ficha — SQL',       type: 'Ficha',  subtitle: 'Queries · 7 páginas', rating: 4 },
    ],
  },
};
