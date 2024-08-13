"use client";

import { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, I encountered an error.", sender: "bot" },
      ]);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        AI Support Chatbot
      </Typography>
      <Box
        sx={{
          height: "60vh",
          overflowY: "auto",
          mb: 2,
          border: "1px solid #ccc",
          borderRadius: 1,
          p: 2,
        }}
      >
        {messages.map((message, index) => (
          <Typography
            key={index}
            align={message.sender === "user" ? "right" : "left"}
          >
            <strong>{message.sender === "user" ? "You: " : "Bot: "}</strong>
            {message.text}
          </Typography>
        ))}
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          variant="outlined"
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Send
        </Button>
      </form>
    </Container>
  );
}
