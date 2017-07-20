// In IE11, Date#toLocaleString does not support the timeZone option.
try {
  new Date().toLocaleString('en-US', {timeZone: 'America/New_York'})
} catch (error) {
  const {prototype} = Date
  const {toLocaleString} = prototype
  prototype.toLocaleString = function (locale, options) {
    if (options) delete options.timeZone
    return toLocaleString.call(this, locale, options)
  }
}
