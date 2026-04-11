const STATUS_CODES = {
  200: 'OK',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

const ERROR_RESPONSES = {
  400: { error: 'Bad Request' },
  401: { error: 'Unauthorized' },
  403: { error: 'Forbidden' },
  404: { error: 'Not Found' },
  405: { error: 'Method Not Allowed' },
  409: { error: 'Conflict' },
  422: { error: 'Unprocessable Entity' },
  500: { error: 'Internal Server Error' },
  502: { error: 'Bad Gateway' },
  503: { error: 'Service Unavailable' },
};

module.exports = { STATUS_CODES, ERROR_RESPONSES };
