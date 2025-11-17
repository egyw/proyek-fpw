import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { trpc } from '@/utils/trpc';
import { Card } from '@/components/ui/card';

interface Conversation {
  id: string;
  visitorName: string;
  visitorEmail?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status?: string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageCircle, Send, Users, Clock } from 'lucide-react';

export default function AdminChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Fetch conversations (auto-refresh every 5 seconds)
  const { data: conversationsData, isLoading: loadingConversations, error: conversationsError } = trpc.chat.getConversations.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );
  
  // Fetch selected conversation details (auto-refresh every 3 seconds)
  const { data: conversationData, refetch: refetchConversation } = trpc.chat.getConversation.useQuery(
    { conversationId: selectedConversation || '' },
    { 
      enabled: !!selectedConversation,
      refetchInterval: 3000 
    }
  );

  // Fetch chat stats (auto-refresh every 10 seconds)
  const { data: statsData } = trpc.chat.getStats.useQuery(
    undefined,
    { refetchInterval: 10000 }
  );

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput('');
      refetchConversation();
      toast.success('Pesan berhasil dikirim');
    },
    onError: (error) => {
      toast.error('Gagal mengirim pesan', {
        description: error.message,
      });
    },
  });

  const conversations = conversationsData?.conversations || [];
  const currentConversation = conversationData?.conversation;
  const stats = statsData?.stats;

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      message: messageInput,
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return 'Baru saja';
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} jam lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Chat</h1>
          <p className="text-gray-600 mt-1">Kelola percakapan dengan customer</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chat Aktif</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {stats?.activeChats || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Chat</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {stats?.totalChats || 0}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Waktu Respon Rata-rata</p>
                <h3 className="text-2xl font-bold text-orange-600">
                  {stats?.avgResponseTime || '-'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="h-[600px] flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-lg text-gray-800">Percakapan</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-primary mb-3"></div>
                  <p className="text-sm text-gray-700">Memuat percakapan...</p>
                </div>
              ) : conversationsError ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle className="h-7 w-7 text-red-500" />
                  </div>
                  <p className="text-sm text-gray-900 font-semibold mb-1">Gagal memuat chat</p>
                  <p className="text-xs text-gray-600 text-center mb-4">
                    {conversationsError.message}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 w-full text-center">
                    <p className="text-xs text-gray-600">
                      Periksa koneksi internet dan API key
                    </p>
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-900 font-semibold mb-1">Belum ada percakapan</p>
                  <p className="text-xs text-gray-500 text-center">
                    Chat baru akan muncul otomatis
                  </p>
                </div>
              ) : (
                conversations.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                          {conv.visitorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{conv.visitorName}</p>
                          {conv.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conv.unreadCount} baru
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate ml-12">
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 ml-12">
                      {formatTime(conv.lastMessageTime)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-900 font-semibold mb-1">Pilih percakapan</p>
                  <p className="text-xs text-gray-500">
                    Klik chat di sebelah kiri untuk mulai
                  </p>
                </div>
              </div>
            ) : !currentConversation ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-primary mb-2 mx-auto"></div>
                  <p className="text-sm text-gray-600">Memuat pesan...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                      {currentConversation.visitorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {currentConversation.visitorName}
                      </p>
                      {currentConversation.visitorEmail && (
                        <p className="text-sm text-gray-600">
                          {currentConversation.visitorEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'agent'
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === 'agent'
                              ? 'text-blue-100'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ketik pesan..."
                      className="flex-1"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Kirim
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
