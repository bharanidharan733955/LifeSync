import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function MobileAI() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Diet Assistant. How can I assist with your meals or sugar reduction today?',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text:
            'Tip: Replacing sweetened evening tea with spiced buttermilk (chaas) saves ~14g of added sugar and promotes digestion!',
        },
      ]);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>🔒 Medical diagnosis not provided. Dietary guidance only.</Text>
      </View>

      <ScrollView style={styles.chatArea}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                m.sender === 'user' ? styles.userText : styles.aiText,
              ]}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask for healthy Indian meal suggestions..."
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  banner: {
    backgroundColor: '#eef2ff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 11,
    color: '#4338ca',
    fontWeight: '600',
    textAlign: 'center',
  },
  chatArea: {
    flex: 1,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userBubble: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  aiText: {
    color: '#1e293b',
  },
  userText: {
    color: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 13,
    color: '#0f172a',
  },
  sendBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  sendText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});

