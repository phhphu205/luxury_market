document.addEventListener("DOMContentLoaded", () => {
    // 1. Tiêm HTML của Chatbox vào body
    const chatHTML = `
        <div id="ai-chat-widget">
            <button id="ai-chat-btn" title="Chat với AI Trợ lý">🤖</button>
            <div id="ai-chat-box" class="hidden">
                <div class="chat-header">
                    <h3>✨ Trợ lý AI Luxury</h3>
                    <button id="ai-close-btn">&times;</button>
                </div>
                <div class="chat-body" id="ai-chat-body">
                    <div class="message ai">Xin chào! Tôi là trợ lý AI của Luxury Market. Bạn cần tư vấn về sản phẩm nào hôm nay?</div>
                </div>
                <div class="chat-footer">
                    <input type="text" id="ai-chat-input" placeholder="Nhập câu hỏi của bạn..." autocomplete="off" />
                    <button id="ai-send-btn">Gửi</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 2. Tiêm CSS cho Chatbox
    const style = document.createElement('style');
    style.innerHTML = `
        #ai-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'DM Sans', sans-serif; }
        #ai-chat-btn { width: 60px; height: 60px; border-radius: 50%; background: var(--accent, #e63946); color: white; font-size: 28px; border: none; cursor: pointer; box-shadow: 0 4px 16px rgba(230,57,70,0.4); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; justify-content: center; align-items: center; }
        #ai-chat-btn:hover { transform: scale(1.1); }
        
        #ai-chat-box { position: absolute; bottom: 80px; right: 0; width: 360px; height: 480px; background: var(--bg, #fff); border-radius: 16px; box-shadow: 0 12px 32px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border, #eee); transition: all 0.3s ease; transform-origin: bottom right; }
        #ai-chat-box.hidden { transform: scale(0.5); opacity: 0; pointer-events: none; }
        
        .chat-header { background: var(--accent, #e63946); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        .chat-header h3 { margin: 0; font-size: 1.05rem; font-weight: 600; letter-spacing: 0.5px; }
        #ai-close-btn { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; line-height: 1; transition: opacity 0.2s; }
        #ai-close-btn:hover { opacity: 0.7; }
        
        .chat-body { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--bg2, #fafafa); scroll-behavior: smooth; }
        .message { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 0.9rem; line-height: 1.5; color: var(--text, #333); word-wrap: break-word; }
        .message.ai { background: var(--card, #fff); border: 1px solid var(--border, #eee); align-self: flex-start; border-bottom-left-radius: 4px; }
        .message.user { background: var(--accent, #e63946); color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
        
        .chat-footer { padding: 12px; background: var(--bg, #fff); border-top: 1px solid var(--border, #eee); display: flex; gap: 8px; }
        #ai-chat-input { flex: 1; padding: 12px 16px; border: 1.5px solid var(--border, #ddd); border-radius: 24px; outline: none; font-family: inherit; font-size: 0.9rem; background: var(--bg, #fff); color: var(--text, #333); transition: border-color 0.2s; }
        #ai-chat-input:focus { border-color: var(--accent, #e63946); }
        #ai-send-btn { padding: 8px 18px; background: var(--accent, #e63946); color: white; border: none; border-radius: 24px; cursor: pointer; font-weight: 600; transition: opacity 0.2s; }
        #ai-send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    `;
    document.head.appendChild(style);

    // 3. Xử lý Logic Chat
    const chatBtn = document.getElementById('ai-chat-btn');
    const chatBox = document.getElementById('ai-chat-box');
    const closeBtn = document.getElementById('ai-close-btn');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-chat-input');
    const body = document.getElementById('ai-chat-body');

    chatBtn.addEventListener('click', () => chatBox.classList.toggle('hidden'));
    closeBtn.addEventListener('click', () => chatBox.classList.add('hidden'));

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // Hiển thị tin nhắn user
        body.insertAdjacentHTML('beforeend', `<div class="message user">${text}</div>`);
        input.value = '';
        body.scrollTop = body.scrollHeight;

        // Trạng thái đang tải
        const loadingId = 'loading-' + Date.now();
        body.insertAdjacentHTML('beforeend', `<div class="message ai" id="${loadingId}">Đang suy nghĩ... 🤔</div>`);
        body.scrollTop = body.scrollHeight;
        sendBtn.disabled = true;
        input.disabled = true;

        try {
            // Gọi API FastAPI
            const res = await fetch('http://127.0.0.1:8000/api/chat_ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            
            document.getElementById(loadingId).remove();
            // Format xuống dòng
            const formattedReply = data.reply ? data.reply.replace(/\n/g, '<br>') : "Xin lỗi, tôi không thể trả lời lúc này.";
            body.insertAdjacentHTML('beforeend', `<div class="message ai">${formattedReply}</div>`);
        } catch (error) {
            document.getElementById(loadingId).remove();
            body.insertAdjacentHTML('beforeend', `<div class="message ai">⚠️ Lỗi kết nối đến máy chủ AI.</div>`);
        }
        
        body.scrollTop = body.scrollHeight;
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
});