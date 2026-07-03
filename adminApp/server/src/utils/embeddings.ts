import { embed } from 'ai'
import { mistral } from '@ai-sdk/mistral'


export async function generateNewsEmbedding(content: string): Promise<number[]> {
  if (!content || content.trim() === '') {
    throw new Error('Content cannot be empty for embedding generation')
  }
  
  const { embedding } = await embed({
    model: mistral.embedding('mistral-embed'),
    value: content.trim(),
  })
  
  return embedding
}
