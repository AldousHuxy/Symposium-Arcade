export type StormEvent = {
  name: string;
  level: number;
  description: string;
  probability: string;
}

export const STORM_EVENTS: StormEvent[] = [
  { name: '10-Year Storm',  level: 0.2,  description: 'A moderate rainfall event',      probability: '10% annual chance' },
  { name: '50-Year Storm',  level: 0.55, description: 'A significant rainfall event',    probability: '2% annual chance' },
  { name: '100-Year Storm', level: 0.8,  description: 'The FEMA regulatory flood event', probability: '1% annual chance' },
  { name: '500-Year Storm', level: 1.6,  description: 'A catastrophic flood event',      probability: '0.2% annual chance' },
];
