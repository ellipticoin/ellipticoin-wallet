export default class SharedEventSource {
  constructor(url) {
    if (typeof SharedWorker !== "function") {
      return new EventSource(...arguments);
    }
    this.listeners = {};
    let code = `
            var source = new EventSource("${url}")
            onconnect = function(e) {
                try {
                    var port = e.ports[0]
                        port.onmessage = (message) => {
                            source.addEventListener(message.data, (e) => port.postMessage([message.data, 
                                        {
data:e.data,
orgin: e.origin,
lastEventId: e.lastEventId,
}
                            ])) 
                            }
} catch(e) {
    port.postMessage(e)
}
}
`;
    this.worker = new SharedWorker(
      "data:application/javascript," + encodeURIComponent(code)
    );
    this.worker.port.onmessage = (e) => {
      if (e.data instanceof Error) {
        throw e.data;
      } else {
        this.listeners[e.data[0]](e.data[1]);
      }
    };
  }

  addEventListener(type, listener) {
    this.worker.port.postMessage(type);
    this.listeners[type] = listener;
  }
}
