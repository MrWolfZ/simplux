jest.setTimeout(100)

// unfortunately testing for unhandled rejections inside a test is
// not possible since jest mocks the global process object (see here:
// https://github.com/facebook/jest/issues/5620); as a workaround we
// add a handler here that at least makes sure no unhandled rejections
// are missed/silently ignored
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', (reason) => {
    throw reason
  })

  process.env.LISTENING_TO_UNHANDLED_REJECTION = true
}
