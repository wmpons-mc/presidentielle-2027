import { z } from 'zod';
import { id,ref,text,digest } from './schemas.ts';

const timestamp=z.iso.datetime();
const observedTime=z.discriminatedUnion('state',[
  z.strictObject({state:z.literal('known'),value:timestamp}),
  z.strictObject({state:z.literal('unknown')}),
]);
const section=z.strictObject({title:text,paragraphs:z.array(text).min(1).max(30)});
export const availablePublicationSchema=z.strictObject({
  schemaVersion:z.literal('1.0.0'),state:z.literal('available'),fixture:z.boolean(),
  datasetSha256:digest,
  method:z.strictObject({
    version:z.string().min(1).max(120),
    definitions:section,sources:section,limits:section,workflow:section,
    references:z.array(z.strictObject({title:text,url:z.url({protocol:/^https?$/})})).max(30),
  }),
  responsibility:section,funding:section,
  lastSuccessfulCollection:observedTime,collectionScope:text,lastPublication:observedTime,
  corrections:z.array(z.strictObject({
    id,kind:z.literal('editorial_correction'),publishedAt:timestamp,summary:text,
    collection:z.enum(['actors','topics','questions','sources','propositions']),before:ref,after:ref,
  })).max(10_000),
});
export const publicationSchema=z.discriminatedUnion('state',[
  z.strictObject({schemaVersion:z.literal('1.0.0'),state:z.literal('unavailable')}),
  availablePublicationSchema,
]);
export type Publication=z.infer<typeof publicationSchema>;
export type AvailablePublication=z.infer<typeof availablePublicationSchema>;
