export interface Answer {
  promptId: number
  answer: string
}

export interface PromptsAnswers {
  prompts: string[]
  answers: Answer[]
}
