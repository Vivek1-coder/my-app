import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth"


export async function POST(request:Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user:User = session?.user as User

    if(!session || !session.user){
        return Response.json(
            {
                success : false,
                message:"Not Authentication"
            },
            { status : 401 }
        )
    }

    const userId = user._id;
    const {acceptMessages} = await request.json()

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
        {isAcceptingMessages: acceptMessages},
        {new:true})

        if(!updatedUser){
            return Response.json(
                {
                    success:false,
                    message:"failed to update user status to accept messages"
                },{
                    status:401
                }
            )
        }

        else{
            return Response.json(
                {
                    success:true,
                    message:"Message acceptance status changed successfully",
                    updatedUser
                },{
                    status:201
                }
            )
        }

    }catch(error){
        console.log("failed to update user status to accept messages")
        return Response.json(
            {
                success:false,
                message:`failed to update user status to accept messages ${error}`
            },{
                status:500
            }
        )
    }

}

export async function GET(){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user:User = session?.user as User

    if(!session || !session.user){
        return Response.json(
            {
                success : false,
                message:"Not Authentication"
            },
            { status : 401 }
        )
    }

    const userId = user._id;

    
    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json(
                {
                    success:false,
                    message:"User not found "
                },{
                    status:404
                }
            )
        }
        return Response.json(
            {
                success:true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {status:200}
        )
    } catch (error) {
        console.log("Error in getting message acceptance status")
        return Response.json(
            {
                success:false,
                message:`Error in getting message acceptance status ${error}`
            },{
                status:500
            }
        )
    }

}