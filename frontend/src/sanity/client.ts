import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const projectId = '4ekjvbr6'
export const dataset = 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false for real-time data, true for production cache
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
    return builder.image(source)
}
