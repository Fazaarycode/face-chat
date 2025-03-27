import ChatRoom from "../../models/ChatRoom";
import Message from "../../models/Message";
import dbConnect from "../../utils/db";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { name } = req.body;
    const chatRoom = await ChatRoom.create({ name });
    res.status(200).json(chatRoom);
  } else if (req.method === "GET") {
    const rooms = await ChatRoom.find();
    res.status(200).json(rooms);
  }
}
