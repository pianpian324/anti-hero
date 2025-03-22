import logging
import asyncio
import pytz
import json
import os
import time
import traceback
from datetime import datetime, timedelta
from telegram import Bot, Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import httpx
from collections import defaultdict

# 配置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 配置
TOKEN = "...."  # 替换为你的Telegram机器人token
DEEPSEEK_API_KEY = "...."  # 替换为你的硅基流动Deepseek API密钥
DEEPSEEK_API_URL = "https://api.siliconflow.cn/v1/chat/completions"  # 硅基流动API地址
SOURCE_GROUP_ID = "...."  # 要监控的群组ID
TARGET_GROUP_ID = "....."  # 要发送总结的管理群ID
TIMEZONE = pytz.timezone('Asia/Shanghai')  # 设置为中国时区

# 存储消息的字典
daily_messages = defaultdict(list)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """发送启动消息"""
    await update.message.reply_text('聊天总结机器人已启动！每天将总结群组聊天内容。')

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """发送帮助信息"""
    help_text = """
    使用说明:
    /start - 启动机器人
    /help - 显示帮助信息
    /summary - 立即生成今日总结
    """
    await update.message.reply_text(help_text)

async def collect_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """收集群组中的消息"""
    # 跳过非源群组的消息
    if str(update.effective_chat.id) != SOURCE_GROUP_ID:
        return
    
    # 跳过命令消息
    if update.message and update.message.text and update.message.text.startswith('/'):
        return
        
    # 检查消息是否为文本
    if not update.message or not update.message.text:
        return
    
    now = datetime.now(TIMEZONE)
    date_str = now.strftime('%Y-%m-%d')
    
    # 存储消息
    message_info = {
        'user_id': update.message.from_user.id,
        'username': update.message.from_user.username or update.message.from_user.first_name,
        'text': update.message.text,
        'time': now.strftime('%H:%M:%S')
    }
    
    daily_messages[date_str].append(message_info)
    logger.info(f"收集到消息 - 群组: {update.effective_chat.id}, 日期: {date_str}, 用户: {message_info['username']}")


async def generate_summary_with_deepseek(messages_list):
    """使用Deepseek API生成总结"""
    # 格式化消息为可读形式
    formatted_messages = []
    for msg in messages_list:
        formatted_msg = f"[{msg['time']}] {msg['username']}: {msg['text']}"
        formatted_messages.append(formatted_msg)
    
    all_messages = "\n".join(formatted_messages)
    
    # 构建提示
    prompt = f"""
    以下是Telegram群组中过去24小时的聊天记录:
    
    {all_messages}
    
    请提供以下内容:
    1. 聊天内容的总体摘要
    2. 主要讨论话题和情绪分析
    3. 值得关注的重要信息或观点（用"【重要】"标记）
    4. 任何值得注意的异常或问题
    
    请用中文回复，并保持客观专业。
    """
    
    # 准备API请求
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",  # 或其他适合的模型
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.5,
        "max_tokens": 16384,
        "stream": False,
        "top_p": 0.7,
        "top_k": 50,
        "frequency_penalty": 0.0,
        "n": 1,
        "response_format": {"type": "text"}
    }
    
    try:
        async with httpx.AsyncClient(timeout=90) as client:  # 增加超时时间
            logger.info("正在调用Deepseek API...")
            logger.info(f"API URL: {DEEPSEEK_API_URL}")
            logger.info(f"请求数据: {json.dumps(data, ensure_ascii=False)[:200]}...")

            response = await client.post(DEEPSEEK_API_URL, headers=headers, json=data)
            
            # 记录API响应详情用于调试
            logger.info(f"API状态码: {response.status_code}")
            # 记录API响应详情用于调试
            logger.info(f"API状态码: {response.status_code}")
            
            # 尝试获取响应内容
            response_text = response.text
            logger.info(f"API响应内容: {response_text[:200]}...")  # 记录前200个字符
            
            response.raise_for_status()  # 如果状态码不是2xx，抛出异常
            
            result = response.json()
            
            # 检查API响应结构
            if "choices" not in result or len(result["choices"]) == 0:
                error_msg = f"API响应格式异常: {result}"
                logger.error(error_msg)
                return f"生成总结时出错: API响应格式异常。请检查API配置。"
            
            if "message" not in result["choices"][0] or "content" not in result["choices"][0]["message"]:
                error_msg = f"API响应消息格式异常: {result['choices'][0]}"
                logger.error(error_msg)
                return f"生成总结时出错: API响应消息格式异常。请检查API配置。"
            
            summary = result["choices"][0]["message"]["content"]
            return summary
    except httpx.HTTPStatusError as e:
        error_msg = f"API请求失败 (状态码: {e.response.status_code}): {e.response.text}"
        logger.error(error_msg)
        return f"生成总结时出错: API请求失败 (HTTP {e.response.status_code})。请检查API密钥和URL配置。"
    except httpx.RequestError as e:
        error_msg = f"网络请求异常: {str(e)}"
        logger.error(error_msg)
        # 添加更多调试信息
        logger.error(f"API URL: {DEEPSEEK_API_URL}")
        logger.error(f"异常详情: {traceback.format_exc()}")
        return f"生成总结时出错: 网络请求异常 - {str(e)}。请检查网络连接和API URL配置。"
    except json.JSONDecodeError as e:
        error_msg = f"API响应解析失败: {str(e)}, 响应内容: {response_text}"
        logger.error(error_msg)
        return f"生成总结时出错: API响应不是有效的JSON格式。请检查API配置。"
    except Exception as e:
        error_msg = f"生成总结时发生未知错误: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        return f"生成总结时出错: {str(e)}"

async def create_daily_summary():
    """创建每日总结并发送到目标群组"""
    today = datetime.now(TIMEZONE).strftime('%Y-%m-%d')
    yesterday = (datetime.now(TIMEZONE) - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 获取昨天的消息
    messages_to_summarize = daily_messages.get(yesterday, [])
    
    # 如果没有消息，则发送空总结
    if not messages_to_summarize:
        logger.info(f"昨天 ({yesterday}) 没有消息可总结")
        return
    
    # 生成总结
    summary = await generate_summary_with_deepseek(messages_to_summarize)
    
    # 构建总结消息
    header = f"📊 {yesterday} 群组聊天总结 📊\n\n"
    footer = f"\n\n💬 总消息数: {len(messages_to_summarize)} | 👥 参与用户数: {len(set(msg['user_id'] for msg in messages_to_summarize))}"
    
    full_summary = header + summary + footer
    
    # 发送总结到目标群组
    bot = Bot(token=TOKEN)
    await bot.send_message(chat_id=TARGET_GROUP_ID, text=full_summary, parse_mode='HTML')
    logger.info(f"已发送 {yesterday} 的聊天总结到群组 {TARGET_GROUP_ID}")
    
    # 清理旧数据（可选）
    if yesterday in daily_messages:
        del daily_messages[yesterday]


async def fetch_recent_messages(chat_id, limit=100):
    """获取指定群组的最近消息（注意：由于Telegram API限制，此函数只能获取机器人添加后的消息）"""
    logger.info(f"尝试从群组 {chat_id} 获取历史消息")
    
    # 我们改为返回已经收集的所有消息
    all_messages = []
    
    # 合并所有日期的消息
    for date, messages in daily_messages.items():
        all_messages.extend(messages)
    
    # 按时间排序并限制数量
    all_messages.sort(key=lambda x: x.get('time', '00:00:00'), reverse=True)
    return all_messages[:limit]


async def manual_summary(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """手动触发生成今日总结"""
    await update.message.reply_text("正在获取并总结最近消息，请稍候...")
    
    # 获取所有收集到的消息
    messages_to_summarize = await fetch_recent_messages(None)
    
    if not messages_to_summarize:
        await update.message.reply_text("目前尚未收集到任何消息。请确保机器人已添加到群组并能接收消息。机器人只能总结它启动后收到的消息。")
        return
    
    await update.message.reply_text(f"已获取 {len(messages_to_summarize)} 条消息，正在生成总结...")
    
    # 生成总结
    summary = await generate_summary_with_deepseek(messages_to_summarize)
    
    # 构建总结消息
    current_time = datetime.now(TIMEZONE).strftime('%Y-%m-%d %H:%M')
    header = f"📊 群组聊天总结 (截至 {current_time}) 📊\n\n"
    footer = f"\n\n💬 总消息数: {len(messages_to_summarize)} | 👥 参与用户数: {len(set(msg['user_id'] for msg in messages_to_summarize))}"
    
    full_summary = header + summary + footer
    
    # 发送总结
    await update.message.reply_text(full_summary, parse_mode='HTML')
    logger.info(f"已生成临时聊天总结，共 {len(messages_to_summarize)} 条消息")


async def scheduled_job():
    """定时任务，每天执行一次"""
    while True:
        now = datetime.now(TIMEZONE)
        # 设置为每天凌晨00:05执行总结任务
        target_time = now.replace(hour=0, minute=5, second=0, microsecond=0)
        
        # 如果当前时间已过目标时间，则设置为明天的目标时间
        if now >= target_time:
            target_time = target_time + timedelta(days=1)
        
        # 计算等待时间
        wait_seconds = (target_time - now).total_seconds()
        logger.info(f"等待 {wait_seconds/3600:.2f} 小时后执行总结任务")
        
        # 等待到指定时间
        await asyncio.sleep(wait_seconds)
        
        # 执行任务
        await create_daily_summary()

async def save_messages():
    """定期保存消息到文件（防止机器人重启数据丢失）"""
    while True:
        try:
            with open('message_history.json', 'w', encoding='utf-8') as f:
                json.dump(daily_messages, f, ensure_ascii=False, indent=2)
            logger.info("消息数据已保存")
        except Exception as e:
            logger.error(f"保存消息数据时出错: {str(e)}")
        
        # 每10分钟保存一次
        await asyncio.sleep(600)

def load_messages():
    """从文件加载消息历史"""
    global daily_messages
    try:
        if os.path.exists('message_history.json'):
            with open('message_history.json', 'r', encoding='utf-8') as f:
                loaded_data = json.load(f)
                # 将加载的数据转换为defaultdict
                daily_messages = defaultdict(list, loaded_data)
            logger.info("已从文件加载消息历史")
    except Exception as e:
        logger.error(f"加载消息历史时出错: {str(e)}")


async def send_startup_summary():
    """启动时发送一条测试总结到目标群组"""
    try:
        # 获取所有历史消息
        all_messages = []
        for date, messages in daily_messages.items():
            all_messages.extend(messages)
        
        # 如果有消息，生成总结并发送
        if all_messages:
            logger.info(f"启动时发送测试总结，使用 {len(all_messages)} 条历史消息")
            
            # 生成总结
            summary = await generate_summary_with_deepseek(all_messages)
            
            # 构建总结消息
            current_time = datetime.now(TIMEZONE).strftime('%Y-%m-%d %H:%M')
            header = f"📊 群组聊天总结 (机器人启动测试) 📊\n\n"
            footer = f"\n\n💬 总消息数: {len(all_messages)} | 👥 参与用户数: {len(set(msg['user_id'] for msg in all_messages))}"
            
            full_summary = header + summary + footer
            
            # 发送总结到目标群组
            bot = Bot(token=TOKEN)
            await bot.send_message(chat_id=TARGET_GROUP_ID, text=full_summary, parse_mode='HTML')
            logger.info(f"已发送启动测试总结到群组 {TARGET_GROUP_ID}")
        else:
            logger.info("没有历史消息可用于测试总结")
    except Exception as e:
        logger.error(f"发送启动测试总结失败: {str(e)}")

def main() -> None:
    """启动机器人"""
    # 加载历史消息
    load_messages()
    
    while True:
        try:
            # 创建应用
            application = Application.builder().token(TOKEN).build()
            
            # 添加处理程序
            application.add_handler(CommandHandler("start", start))
            application.add_handler(CommandHandler("help", help_command))
            application.add_handler(CommandHandler("summary", manual_summary))
            application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, collect_message))
            
            # 启动异步任务
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # 启动异步任务
            loop.create_task(scheduled_job())
            loop.create_task(save_messages())

            # 添加启动时测试发送总结的任务
            loop.create_task(send_startup_summary())
            
            # 启动机器人并保持运行
            logger.info("机器人启动中...")
            application.run_polling(allowed_updates=Update.ALL_TYPES, drop_pending_updates=True)
        except Exception as e:
            logger.error(f"机器人运行出错: {str(e)}")
            logger.info("30秒后尝试重启机器人...")
            time.sleep(30)  # 等待30秒后重试

if __name__ == "__main__":
    main()