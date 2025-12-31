(() => {
  let lastUrl = location.href;

  function notifyFriendFocusUrlChanged() {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      window.postMessage({ type: 'friendfocus-fb-url-changed', url }, '*');
    }
  }

  function wrapHistoryMethod(original) {
    function wrapped(...args) {
      // 1️⃣ Call Facebook FIRST
      const result = original.apply(this, args);

      // 2️⃣ Notify AFTER the call (async, zero impact)
      queueMicrotask(notifyFriendFocusUrlChanged);

      return result;
    }

    // 3️⃣ Preserve native fingerprints
    Object.defineProperties(wrapped, {
      length: { value: original.length },
      name: { value: original.name },
      toString: {
        value: () => original.toString(),
      },
    });

    return wrapped;
  }

  history.pushState = wrapHistoryMethod(history.pushState);
  history.replaceState = wrapHistoryMethod(history.replaceState);

  window.addEventListener('popstate', notifyFriendFocusUrlChanged);
})();
