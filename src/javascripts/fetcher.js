define("fetcher", ["d3"], function(d3) {

  var MAX_CONCURRENCY = 8
    , queue = []
    , inProgress = 0;

  function request(url, callback) {
    return {
      url: url,
      callback: callback,
      cancelled: false,
      cancel: function() {
        cancelled = true;
      }
    };
  }

  function processQueue() {
    if (inProgress < MAX_CONCURRENCY && queue.length > 0) {
      performRequest(queue.shift());
    }
  }

  function performRequest(request) {
    ++inProgress;
    d3.json(request.url, function(error, json) {
      --inProgress;
      processQueue();
      if (!request.cancelled) {
        request.callback(error, json);
      }
    });
  }

  return function(url, callback) {
    queue.push(new request(url, callback));
    processQueue();
  };
});
