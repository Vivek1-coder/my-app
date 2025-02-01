import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request:Request) {
    await dbConnect();
    console.log("Sending message....")
    try {
        const {username,content} = await request.json()
        if(!username || !content){
            return Response.json(
                {
                    success : false,
                    message:"Username or content not available"
                },
                { status : 404 }
            )
        }
        const user = await UserModel.findOne({username})
        if(!user){
            return Response.json(
                {
                    success : false,
                    message:"No Username of this name"
                },
                { status : 404 }
            )
        }
        
        //is user accepting the messages
        if(!user.isAcceptingMessages){
            return Response.json(
                {
                    success:false,
                    message:"User is not accepting the messages"
                },
                {status:403}
            )
        }

        const newMessage= {content,createdAt:new Date()}
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
            {
                success : true,
                message:"message sent successfully"
            },
            { status : 200 }
        )
    } catch (error) {
        console.log("An unexpected Error while sending messages",error)
        return Response.json(
            {
                success : false,
                message:"An unexpected Error while sending messages"
            },
            { status : 500 }
        )
    }
}