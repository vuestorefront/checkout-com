export const apiRequestHeaders = channel => ({
  headers: {
    authorization: channel.secretKey,
    'Content-Type': 'application/json'
  }
});