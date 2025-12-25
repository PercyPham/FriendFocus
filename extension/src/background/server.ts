import {
  MESSAGE_TYPES,
  MessageContract,
  MessageType,
} from '../common/background_contract/contract';

type Handler<T extends MessageType> = (
  payload: MessageContract[T]['req'],
  sender: chrome.runtime.MessageSender
) => Promise<MessageContract[T]['res']>;

const handlers: Partial<Record<MessageType, Handler<any>>> = {};

export function onMessage<T extends MessageType>(type: T, handler: Handler<T>) {
  handlers[type] = handler;
}

export function setupMessageListener() {
  for (const type of MESSAGE_TYPES) {
    if (!handlers[type]) throw new Error(`Handler for ${type} not found`);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type, payload } = message;

    const handler = handlers[type as MessageType];

    if (handler) {
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
