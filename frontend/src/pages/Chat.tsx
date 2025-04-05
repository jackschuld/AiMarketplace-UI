import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Message } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendorName, setVendorName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams<{ conversationId: string }>();
  const { token, user } = useAuth();

  // Generate a random vendor name if not already set
  useEffect(() => {
    if (!vendorName) {
      const firstNames = [
        'Sly', 'Sylvestor', 'Marc', 'Bradley', 'James', 'Phil', 'Nancy', 'Ann', 
        'Warren', 'Pete', 'Keith', 'Jack', 'Meg', 'Richard', 'Ray', 'Dave', 
        'Davy', 'Grace', 'Gwen', 'Tina', 'Janis', 'Nina', 'Cass', 'Brian', 
        'David', 'Frank', 'Reginald', 'Mark', 'Louie', 'Neil'
      ];
      
      const lastNames = [
        'Stone', 'Bolan', 'Nowell', 'McCartney', 'Lynott', 'Wilson', 'Zevon', 
        'Townshend', 'Moon', 'White', 'Starsky', 'Davies', 'Jones', 'Slick', 
        'Stefani', 'Turner', 'Joplin', 'Simone', 'Elliot', 'Wilson', 'Zappa', 
        'Dwight', 'Feld', 'Young'
      ];
      
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      setVendorName(`${randomFirstName} ${randomLastName}`);
    }
  }, [vendorName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!token || !conversationId) return;
        const response = await api.messages.getMessages(conversationId, token);
        if (response.success && response.data) {
          const formattedMessages = response.data.map(msg => ({
            ...msg,
            isUser: msg.isUser || false
          }));
          setMessages(formattedMessages);
        } else {
          setError(response.error || 'Failed to fetch messages');
        }
      } catch (err) {
        setError('An error occurred while fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [token, conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.messages.sendMessage(conversationId, input, token);
      if (response.success && response.data) {
        const newMessage: Message = {
          ...response.data,
          isUser: response.data.isUser || false
        };
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setError(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('An error occurred while sending message');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          border: '2px solid #4f46e5', 
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 4rem)', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '1rem' 
    }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem', 
        backgroundColor: 'white', 
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        marginBottom: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.isUser ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}
          >
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              marginBottom: '0.25rem',
              fontWeight: '500'
            }}>
              {message.isUser ? user?.username || 'You' : vendorName}
            </div>
            <div
              style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: message.isUser 
                  ? '0.5rem 0.5rem 0 0.5rem' 
                  : '0.5rem 0.5rem 0.5rem 0',
                backgroundColor: message.isUser ? '#4f46e5' : '#f3f4f6',
                color: message.isUser ? 'white' : '#111827',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}
            >
              {message.content}
              <div style={{ 
                fontSize: '0.75rem', 
                color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                marginTop: '0.25rem',
                textAlign: message.isUser ? 'right' : 'left'
              }}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            outline: 'none'
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat; 