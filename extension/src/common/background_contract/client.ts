import { MessageContract, MessageType } from './contract';

// A generic function that enforces the contract types
export function sendMessage<T extends MessageType>(
  type: T,
  payload?: MessageContract[T]['req']
): Promise<MessageContract[T]['res']> {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        // Check for chrome runtime errors
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
