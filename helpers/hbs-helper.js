module.exports = {
  ifEqual: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  },
  ifInclude: function (a, b, options) {
    return a.includes(b) ? options.fn(this) : options.inverse(this)
  }
}
