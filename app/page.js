'use client'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useEffect, useState } from "react"
import { Box, Button, Stack, TextField, Typography } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([])
  // const [messages, setMessages] = useState([{
  //   text: `Hi, I'm your assistant, here to help you with any life situation you are going through. What would you like advise on today?`,
  //   role: 'bot',
  // }])
  const [userInput, setUserInput] = useState('')
  const [chat, setChat] = useState(null)
  const [error, setError] = useState(null)

  const API_KEY = process.env.API_KEY
  // console.log('API_KEY', process.env.API_KEY)
  console.log('process.env', process.env)
  const MODEL_NAME = 'gemini-1.5-flash'

  const genai = new GoogleGenerativeAI(API_KEY)

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
  }

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genai
          .getGenerativeModel({model: MODEL_NAME})
          .startChat({
            generationConfig,
            history: messages.map((msg) => ({
              text: msg.text,
              role: msg.role,
            })),
          });
          setChat(newChat);
        } catch(error) {
          setError('Failed to initialize chat. Please try again.');
        }
    };
    initChat();
  }, [])

  const handleSendMessage = async () => {
    try {
      const userMessage = {
        text: userInput,
        role: 'user',
      };

      if (userInput.length > 0) {
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setUserInput('');
      }

      if (chat) {
        if (userInput.length > 0) {
          const result = await chat.sendMessage(userInput);
          const botMessage = {
            text: result.response.text(),
            role: 'bot',
          };

          setMessages((prevMessages) => [...prevMessages, botMessage]);
        }
      }
    }
    catch (error) {
      setError('Failed to send message. Please try again.');
    }
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage(e);
    }
  }

  return (
    <Box 
      width='100vw' 
      height='100vh' 
      display='flex' 
      flexDirection='column' 
      justifyContent='center'
      alignItems='center'
      bgcolor='grey'
    >
      <Stack
        direction='column'
        width='80vw'
        height='95vh'
        border='1px solid black'
        p={2}
        spacing={3}
        bgcolor='white'
      >
        <Stack
          direction='column'
          height='3vh'
          border='1px solid black'
          bgcolor='lightgray'
          textAlign='center'
          sx={{
            height: {xs: '7vh'},
            p: {xs: 0, sm: 2.5}
          }}
        >
          <Typography variant="h8">This is your personnal chatbot. Ask me for any advice?</Typography>
        </Stack>
        <Stack
          direction='column'
          spacing={2}
          flexGrow={1}
          overflow='auto'
          maxHeight='100%'
        >
          {messages.map((msg, index) => (
            <Box 
              key={index} 
              display='flex' 
              justifyContent={
                msg.role === 'bot' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  msg.role === 'bot' ? 'primary.main' : 'secondary.main'
                }
                color='white'
                borderRadius={16}
                p={3}
              >
                {msg.text}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction='row' spacing={2}>
          <TextField 
            label = 'Ask away...' 
            fullWidth 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress} 
          ></TextField>
          <Button variant='contained' onClick={handleSendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  )
}