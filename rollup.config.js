module.exports = {
  onwarn: warning => {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return
    }

    // console.warn everything else
    console.warn(warning.message)
  },
}
