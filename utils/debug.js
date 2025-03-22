import fs from 'fs/promises';
import path from 'path';

class DebugLogger {
  constructor() {
    this.logs = [];
    this.logFile = path.join(process.cwd(), 'debug-logs', `debug-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
  }

  async log(type, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    this.logs.push(logEntry);
    
    // 格式化日志条目
    const logString = `[${timestamp}] [${type}] ${message}\n${data ? `Data: ${JSON.stringify(data, null, 2)}\n` : ''}\n`;
    
    try {
      // 确保日志目录存在
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      // 追加日志
      await fs.appendFile(this.logFile, logString, 'utf8');
    } catch (error) {
      console.error('Error writing to log file:', error);
    }

    // 同时输出到控制台
    console.log(`[${type}]`, message, data || '');
  }

  async error(message, error) {
    await this.log('ERROR', message, {
      message: error.message,
      stack: error.stack,
      ...(error.response ? { 
        status: error.response.status,
        statusText: error.response.statusText,
        data: await error.response.text().catch(() => null)
      } : {})
    });
  }

  async info(message, data) {
    await this.log('INFO', message, data);
  }

  async api(method, url, requestData, responseData) {
    await this.log('API', `${method} ${url}`, {
      request: requestData,
      response: responseData
    });
  }

  async getLogs() {
    return this.logs;
  }

  getLogFilePath() {
    return this.logFile;
  }
}

// 创建单例实例
const debugLogger = new DebugLogger();
export default debugLogger;
