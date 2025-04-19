import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Message, Level, UserLevel } from '../types';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { usePoints } from '../context/PointsContext';

interface PriceOffer {
  price: number;
  messageId: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendorName, setVendorName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams<{ conversationId: string }>();
  const { token, user } = useAuth();
  const { totalPoints } = usePoints();
  const [currentOffer, setCurrentOffer] = useState<PriceOffer | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [level, setLevel] = useState<Level | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionPrice, setCompletionPrice] = useState<number | null>(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
          
          // Check if any message has isAccepted flag
          const completedMessage = formattedMessages.find(msg => msg.isAccepted);
          if (completedMessage) {
            setIsCompleted(true);
            // Extract price from the user's acceptance message
            const priceMatch = formattedMessages[formattedMessages.length - 2]?.content.match(/\$(\d+)/);
            if (priceMatch) {
              setCompletionPrice(Number(priceMatch[1]));
            }
          }
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

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        if (!token || !conversationId) return;
        const response = await api.levels.getById(conversationId, token);
        if (response.success && response.data) {
          setLevel(response.data);
          
          // Check if level is unlocked
          if (response.data.requiredPoints > totalPoints) {
            // Level is locked, redirect to levels page
            navigate('/levels');
            return;
          }
          
          // Check completion status from userLevels
          if (response.data.userLevels?.[0]?.isCompleted) {
            setIsCompleted(true);
            setCompletionPrice(response.data.userLevels[0].lastOfferedPrice);
          }
        } else {
          setError(response.error || 'Failed to fetch level details');
        }
      } catch (err) {
        setError('An error occurred while fetching level details');
      }
    };

    fetchLevel();
  }, [token, conversationId, totalPoints, navigate]);

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
    setIsTyping(true);

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
      setIsTyping(false);
      setLoading(false);
    }
  };

  const extractPrice = (message: string): number | null => {
    const priceMatch = message.match(/\$(\d+(?:\.\d{2})?)/);
    return priceMatch ? parseFloat(priceMatch[1]) : null;
  };

  const handleAcceptOffer = async () => {
    if (!currentOffer || !token || !conversationId || !level || !user) return;

    try {
      setLoading(true);
      
      // Create UserLevel structure
      const userLevel: UserLevel = {
        user: user,
        level: level,
        chatMessages: messages.map(msg => ({
          ...msg,
          userLevel: undefined
        })),
        id: 0,
        userId: 0,
        levelId: 0,
        isCompleted: false,
        stars: 0,
        lastOfferedPrice: 0,
        vendorOfferedPrice: 0,
        points: 0,
        startedAt: '',
        completedAt: null
      };

      // Add userLevel to each message
      const conversationHistory = messages.map(msg => ({
        ...msg,
        userLevel: userLevel
      }));

      // Add userLevels to the level
      const levelWithUserLevels = {
        ...level,
        userLevels: [userLevel]
      };

      const response = await api.messages.acceptBid(conversationId, {
        acceptedPrice: currentOffer.price,
        level: levelWithUserLevels,
        conversationHistory: conversationHistory
      }, token);

      if (response.success && response.data) {
        const userAcceptMessage: Message = {
          id: Date.now().toString(),
          content: `I accept the offer of $${currentOffer.price}`,
          isUser: true,
          timestamp: new Date().toISOString(),
          userLevel: userLevel
        };

        const botConfirmMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.message,
          isUser: false,
          timestamp: new Date().toISOString(),
          isAccepted: true,
          userLevel: userLevel
        };

        setMessages(prev => [...prev, userAcceptMessage, botConfirmMessage]);
        setCurrentOffer(null);
        setIsCompleted(true);
        setCompletionPrice(currentOffer.price);
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      setError('Failed to accept the offer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isUser) {
      const price = extractPrice(lastMessage.content);
      if (price) {
        setCurrentOffer({
          price,
          messageId: lastMessage.id
        });
      }
    }
  }, [messages]);

  const handleResetChat = async () => {
    if (!token || !conversationId) return;
    
    try {
      setIsResetting(true);
      const response = await api.messages.resetChat(conversationId, token);
      if (response.success) {
        // Refresh messages
        const messagesResponse = await api.messages.getMessages(conversationId, token);
        if (messagesResponse.success && messagesResponse.data) {
          const formattedMessages = messagesResponse.data.map(msg => ({
            ...msg,
            isUser: msg.isUser || false
          }));
          setMessages(formattedMessages);
        }
      } else {
        setError(response.error || 'Failed to reset chat');
      }
    } catch (error) {
      console.error('Failed to reset chat:', error);
      setError('Failed to reset chat');
    } finally {
      setIsResetting(false);
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
      height: '100vh',
      background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)'
    }}>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/levels')}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#4f46e5',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            ←
          </button>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            fontFamily: "'Righteous', 'Poppins', sans-serif",
            letterSpacing: '0.5px'
          }}>
            {level?.name || 'Loading...'}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280',
            fontFamily: "'Poppins', sans-serif"
          }}>
            {totalPoints} pts
          </span>
          {isCompleted && (
            <span style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Completed
            </span>
          )}
        </div>
      </div>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message, index) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.isUser ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              backgroundColor: message.isUser ? '#4f46e5' : 'white',
              color: message.isUser ? 'white' : '#1f2937',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            {!message.isUser && (
              <div style={{ 
                fontWeight: '500', 
                marginBottom: '0.25rem',
                fontSize: '0.875rem',
                color: message.isUser ? 'white' : '#4f46e5'
              }}>
                {vendorName}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
            {message.isAccepted && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.75rem',
                opacity: 0.8
              }}>
                Offer accepted
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'white',
              color: '#1f2937',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            <div style={{ fontWeight: '500', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#4f46e5' }}>
              {vendorName}
            </div>
            <div>Typing...</div>
          </div>
        )}
        {currentOffer && !isCompleted && (
          <div style={{
            alignSelf: 'center',
            maxWidth: '80%',
            width: '100%',
            backgroundColor: '#f3f4f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#4b5563',
              fontFamily: "'Poppins', sans-serif",
              textAlign: 'center'
            }}>
              Vendor offered: <strong>${currentOffer.price}</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.75rem' 
            }}>
              <button
                onClick={handleAcceptOffer}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Accept ${currentOffer.price}
              </button>
              <button
                onClick={() => setCurrentOffer(null)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  fontFamily: "'Poppins', sans-serif"
                }}
              >
                Continue negotiating
              </button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: 'white', 
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            outline: 'none',
            fontSize: '0.875rem',
            fontFamily: "'Poppins', sans-serif"
          }}
          disabled={loading || isCompleted}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || loading || isCompleted}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: !input.trim() || loading || isCompleted ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            opacity: !input.trim() || loading || isCompleted ? 0.7 : 1,
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          Send
        </button>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleResetChat}
        title="Reset Chat"
        message="Are you sure you want to reset this level?"
      />
    </div>
  );
};

export default Chat; 