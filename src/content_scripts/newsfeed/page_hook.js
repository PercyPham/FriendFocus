(() => {
  function genNotifier(trigger) {
    return () => {
      window.postMessage(
        { type: 'friendfocus-fb-changed', trigger: trigger || 'unknown' },
        '*'
      );
    };
  }

  // ----------- History change listener

  function wrapHistoryMethod(original, notifier) {
    function wrapped(...args) {
      // 1️⃣ Call Facebook FIRST
      const result = original.apply(this, args);

      // 2️⃣ Notify AFTER the call (async, zero impact)
      queueMicrotask(notifier);

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

  history.pushState = wrapHistoryMethod(
    history.pushState,
    genNotifier('pushState')
  );
  history.replaceState = wrapHistoryMethod(
    history.replaceState,
    genNotifier('replaceState')
  );

  window.addEventListener('popstate', genNotifier('popstate'));

  // ----------- Visibility change listener

  document.addEventListener('visibilitychange', genNotifier('visibility'));

  if (document.readyState === 'complete') {
    genNotifier('readyState_complete')();
  } else {
    window.addEventListener('load', genNotifier('load'));
  }
})();
