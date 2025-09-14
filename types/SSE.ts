import { ItineraryItem } from "./Activity";


export interface SSEMessage {
  type: 'connected' | 'item' | 'complete' | 'error';
  data?: ItineraryItem;
  message?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'completed' | 'error';