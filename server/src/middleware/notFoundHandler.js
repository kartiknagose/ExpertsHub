// 404 Not Found handler
// This should be mounted after all routes. If no route matched the request,
// this middleware returns a JSON 404 response. Keep responses consistent with
// the API convention (JSON error objects) so client code can handle them.
module.exports = (_req, res) => {
  res.status(404).json({ error: 'Not Found', statusCode: 404 });
};