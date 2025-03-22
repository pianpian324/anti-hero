class ClientLogger {
  constructor() {
    this.prefix = '[Client]';
  }

  _formatError(error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : {})
    };
  }

  _log(type, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `${this.prefix} [${timestamp}] [${type}]`;

    if (data instanceof Error) {
      console[type.toLowerCase()](prefix, message, this._formatError(data));
    } else {
      console[type.toLowerCase()](prefix, message, data || '');
    }

    // 如果在开发环境，保存到localStorage
    if (process.env.NODE_ENV === 'development') {
      try {
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push({
          timestamp,
          type,
          message,
          data: data instanceof Error ? this._formatError(data) : data
        });
        // 只保留最新的100条日志
        if (logs.length > 100) {
          logs.shift();
        }
        localStorage.setItem('debug_logs', JSON.stringify(logs));
      } catch (e) {
        console.error('Error saving log to localStorage:', e);
      }
    }
  }

  error(message, error) {
    this._log('ERROR', message, error);
  }

  info(message, data) {
    this._log('INFO', message, data);
  }

  warn(message, data) {
    this._log('WARN', message, data);
  }

  api(method, url, requestData, responseData) {
    this._log('API', `${method} ${url}`, {
      request: requestData,
      response: responseData
    });
  }

  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('debug_logs') || '[]');
    } catch {
      return [];
    }
  }

  clearLogs() {
    localStorage.removeItem('debug_logs');
  }
}

const clientLogger = new ClientLogger();
export default clientLogger;
