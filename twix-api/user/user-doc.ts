import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User extends Document
{
	name: string;
	username: string;
	password: string;
	comparePassword(password: string): Promise<boolean>;
}

let userSchema = new Schema({
	name: String,
	username: String,
	password: String,
});

userSchema.pre<User>('save', async function(next){
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.comparePassword = async function(password: string)
{
	return await bcrypt.compare(password, this.password);
}

export let UserDoc = class extends model<User>('User', userSchema)
{
	static async findByUsername(username: string): Promise<User>
	{
		try
		{
			let user = await model<User>('User').findOne({username});
			
			if (user === null) 
			{
				throw new Error(`User '${username}' not found`);
			}

			return user;
		}
		catch(err)
		{
			throw err;
		}
	}
}
