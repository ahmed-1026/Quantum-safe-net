import React, { useState, useRef, useEffect } from 'react';

// Custom Robot Icon component
const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5">
        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 16c-1.3 0-2.36.84-2.75 2h5.5c-.39-1.16-1.45-2-2.75-2z" />
    </svg>
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'incoming',
            text: 'Hi there 👋\nHow can I help you today?'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatboxRef = useRef(null);
    const textareaRef = useRef(null);
    const inputInitHeight = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            inputInitHeight.current = textareaRef.current.scrollHeight;
        }
    }, []);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = `${inputInitHeight.current}px`;
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const generateResponse = async (userMessage) => {
        try {
            const response = await fetch(
                `http://localhost:8001/?message=${encodeURIComponent(userMessage)}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/plain',
                    }
                }
            );
    
            if (!response.ok) {
                throw new Error('API response was not ok');
            }
    
            // Changed from response.json() to response.text()
            const data = await response.text();
            return data;
            
        } catch (error) {
            console.error('Error:', error);
            return 'Oops! Something went wrong. Please try again.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = inputMessage.trim();
        if (!message) return;

        // Reset input and adjust height
        setInputMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = `${inputInitHeight.current}px`;
        }

        // Add user message
        setMessages(prev => [...prev, {
            type: 'outgoing',
            text: message
        }]);

        // Show thinking message
        setIsThinking(true);
        const newMessages = [...messages, {
            type: 'outgoing',
            text: message
        }, {
            type: 'incoming',
            text: 'Thinking...'
        }];
        setMessages(newMessages);

        // Generate response
        const response = await generateResponse(message);
        setIsThinking(false);

        // Update messages with response
        setMessages(messages => {
            const updatedMessages = messages.slice(0, -1); // Remove thinking message
            return [...updatedMessages, {
                type: 'incoming',
                text: response
            }];
        });

        // Scroll to bottom
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    };

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={toggleChatbot}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            <div className={`fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <div className="border-b p-4 bg-blue-500 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Chatbot</h2>
                    <button
                        onClick={toggleChatbot}
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="h-96 overflow-y-auto p-4 space-y-4" ref={chatboxRef}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 flex items-start gap-2 ${
                                    message.type === 'outgoing'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {message.type === 'incoming' && <RobotIcon />}
                                <div dangerouslySetInnerHTML={{ __html: message.text }} />
                            </div>
                        </div>
                    ))}
                </div>


                <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
                    <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => {
                            setInputMessage(e.target.value);
                            adjustTextareaHeight();
                        }}
                        placeholder="Type your message..."
                        className="flex-1 resize border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="1"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition-colors"
                        disabled={isThinking}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;