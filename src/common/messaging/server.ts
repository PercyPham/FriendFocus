import { MessageContract, MessageType } from './contract';

// Define a handler type based on the contract
type Handler<T extends MessageType> = (
  payload: MessageContract[T]['req'],
  sender: chrome.runtime.MessageSender
) => Promise<MessageContract[T]['res']>;

// A map of handlers
const handlers: Partial<Record<MessageType, Handler<any>>> = {};

// Function to register a handler (Type-Safe!)
export function onMessage<T extends MessageType>(type: T, handler: Handler<T>) {
  handlers[type] = handler;
}

// The actual listener that sits in background.ts
export function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message;

    const handler = handlers[type as MessageType];

    if (handler) {
      // Handle async handlers naturally
      Promise.resolve(handler(payload, sender))
        .then(sendResponse)
        .catch((err) => {
          console.error(`Error in handler for ${type}:`, err);
          sendResponse({ error: err.message });
        });

      return true; // Indicates we will respond asynchronously
    }
  });
}
