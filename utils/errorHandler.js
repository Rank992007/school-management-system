function classifyError(error) {
  if (error.code === '23505') {
    return { status: 409, message: 'A record with that value already exists' };
  }
  if (error.code === '23503') {
    return { status: 400, message: 'Referenced record does not exist' };
  }
  if (error.code === '23502') {
    return { status: 400, message: 'A required field is missing' };
  }
  if (error.code === '22P02') {
    return { status: 400, message: 'Invalid input syntax' };
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return { status: 503, message: 'Database is temporarily unavailable' };
  }
  return { status: 500, message: 'Server error' };
}

function handleRouteError(res, error) {
  console.error(error);
  const { status, message } = classifyError(error);
  res.status(status).json({ message });
}

module.exports = { classifyError, handleRouteError };
