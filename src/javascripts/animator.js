define('animator', ['d3'], function(d3) {
  var Animator = function(interpolator, callback) {
    this._runCount = 1;
    this._interpolator = interpolator;
    this._callback = callback;
    this._duration = 300;
    this._cancelled = true;
    this._data = {};
    this._ease = d3.ease("linear");
  };

  _.extend(Animator.prototype, {
    ease: function(ease) {
      this._ease = ease;
      return this;
    },

    duration: function(duration) {
      if (duration) {
        this._duration = duration;
        return this;
      } else {
        return this._duration;
      }
    },

    data: function(data) {
      if (!data) {
        return this._data;
      } else {
        this._data = data;
        return this;
      }
    },

    callback: function(callback) {
      this._callback = callback;
      return this;
    },

    interpolator: function(interpolator) {
      this._interpolator = interpolator;
      return this;
    },

    cancel: function() {
      this._cancelled = true;
    },

    start: function() {
      var that = this;
      var runCount = this._runCount += 1;
      this._cancelled = false;

      d3.timer(function(elapsed) {
        if (that._cancelled || runCount != that._runCount) {
          return true;
        }

        var fraction = Math.min(1, 1.0 * elapsed / that._duration);
        var val = that._ease(fraction);
        try {
          that._callback(that._interpolator(val), this._data);
        } finally {
          return fraction >= 1;
        }
      });
    }
  });
  return Animator;
});
