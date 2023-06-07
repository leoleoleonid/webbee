import mongoose from "mongoose";

const LinkedinUsersSchema = new mongoose.Schema({
    url: String,
    firstname: String,
    lastname: String,
    img: String
});

const LinkedinUsersModel = mongoose.model('linkedin_users', LinkedinUsersSchema);
export default LinkedinUsersModel;


export const saveToDb = async (url, firstname, lastname, img) => {
    //TODO need upsert implementation
    const newUser = new LinkedinUsersModel({
        url,
        firstname,
        lastname,
        img
    });
    await newUser.save()
}