import { Schema, model, Document } from 'mongoose';

export interface Post extends Document
{
	username: string;
	text: string;
}

let postSchema = new Schema({
	username: String,
	text: String,
});

postSchema.pre('save', function(next){

	next();
});

export let PostDoc = class extends model<Post>('Post', postSchema)
{
	static async findByUsername(username: string): Promise<Post[]>
	{
		try
		{
			let posts = await model<Post>('Post').find({username});
			
			if (posts === null)
			{
				throw new Error(`User '${username}' not found`);
			}

			return posts;
		}
		catch(err)
		{
			throw err;
		}
	}
}