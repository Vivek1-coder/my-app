import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/model/User";

export async function POST(req:Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get("messageId"); 
        const session = await getServerSession(authOptions)
    const user:User = session?.user as User

    if(!messageId){
        return Response.json(
            {
                success : false,
                message:"Not messageId"
            },
            { status : 401 }
        )
    }

    if(!session || !session.user){
        return Response.json(
            {
                success : false,
                message:"Not Authentication"
            },
            { status : 401 }
        )
    }

    const userId = new mongoose.Types.ObjectId(user._id);
        const updatedUser = await UserModel.findOneAndUpdate(
            {_id:userId},
            { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } }},
            { new: true }
        )

    if(!updatedUser){
        return Response.json(
            {
                success : false,
                message:"Not Updated successfully"
            },
            { status : 401 }
        )
    }

    return Response.json(
        {
            success:true,
            message : "Deleted successfully"
        },{
            status:200
        }
    )

    } catch (error) {
        return Response.json(
            {
                success : false,
                message:`Internal server error ${error}`
            },
            { status : 500 }
        )
    }
}