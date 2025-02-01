'use client'
import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { FileDiff, Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { Input } from "@/components/ui/input"
import { useSession } from 'next-auth/react';

import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';

const page = () => {
  const [messages,setMessages] = useState<Message[]>([]);
  const [isLoading,setIsLoading] = useState(false)
  const [isSending,setIsSending] = useState(false)
  const [isSwitchLoading,setIsSwitchLoading] = useState(false)
  const [fusername,setFusername] = useState("")
  const [content,setContent] = useState("")

  const {toast} = useToast()

  const handleDeleteMessage = (messageId:string)=>{
    setMessages(messages.filter((message)=>message._id !== messageId))
  }

  const {data:session} = useSession()

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register,watch,setValue} = form;

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async(refresh : boolean = false) =>{
    setIsLoading(true)
    setIsSwitchLoading(false)
    try{
      const response = await axios.get<ApiResponse>('/api/get-messages')
      setMessages(response.data.messages || [])
      if(refresh){
        toast({
          title:"Refreshed Messages",
          description:"showing refreshed messages"
          
        })

      }
    }
    catch(error){
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title:"Error",
        description:axiosError.response?.data.message || "Failed to fetch message settings",
        variant:"destructive"
      })
    }
    finally{
      setIsSwitchLoading(false)
      setIsLoading(false)
    }

  },[setIsLoading,setMessages])

 
  
  useEffect(()=>{
    if(!session ||!session.user) return;
    fetchMessages()
    fetchAcceptMessage()

  },[session,setValue,fetchAcceptMessage,fetchMessages])

  // handle switch change
  const handleSwitchChange = async()=>{
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages',{
        acceptMessages: !acceptMessages
      })

      setValue('acceptMessages',!acceptMessages)
      toast({
        title: response.data.message,
        variant:'default'
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title:"Error",
        description:axiosError.response?.data.message || "Failed to fetch message settings",
        variant:"destructive"
      })
    }
  }

  const SendMessage = async() =>{
    try {
      setIsSending(true)
      const response = await axios.post<ApiResponse>(`/api/send-message`,{
        username:fusername,
        content:content
      })
      
      toast({
        title: response.data.message,
        variant:'default'
      })
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title:"Sorry",
        description:axiosError.response?.data.message || "Failed to send message ",
        variant:"destructive"
      })
    }
  }

  if (!session || !session.user) {
    return <div>Please Login </div>;
  }

  const { username } = session?.user as User;
  //TODO: Do more research
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

    return (
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
  
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>
  
        <div className="mb-4">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>
        <Separator />

        <div >
          <form className='flex flex-col gap-3 p-3' onSubmit={SendMessage}>
          
          <input onChange={(e)=>setFusername(e.target.value)} placeholder='Enter the username of friend' className='bg-gray-400 w-60 h-11 text-center text-black bg-opacity-30 rounded-lg'/>
          <textarea onChange={(e)=>setContent(e.target.value)} placeholder='Type the message' className='bg-gray-400 w-full h-32 text-black bg-opacity-30 rounded-lg px-4 py-3'/>
          <button type="submit" className='bg-blue-500 w-32 h-11 rounded-lg p-1'>{isSending?"Sending...":"Send"}</button>
          </form>
        </div>

        <Separator/>
  
        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageCard
                key={message._id as string}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    );
  }
  
export default page
