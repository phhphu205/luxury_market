document.addEventListener("DOMContentLoaded", () => {
    // Xử lý Logic Chat (HTML và CSS đã được tách ra file riêng)
    const chatBtn = document.getElementById('ai-chat-btn');
    const chatBox = document.getElementById('ai-chat-box');
    const closeBtn = document.getElementById('ai-close-btn');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-chat-input');
    const body = document.getElementById('ai-chat-body');

    if (!chatBtn || !chatBox) {
        console.warn("Không tìm thấy Chatbox. Hãy đảm bảo bạn đã chèn assit_ai.html vào trang.");
        return;
    }

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