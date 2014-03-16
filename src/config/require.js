require.config({
  paths: {
    underscore: "vendor/underscore-min",
    d3: "vendor/d3.v3.min"
  },
  shim: {
    underscore: {
      exports: "_"
    }
  }
});
