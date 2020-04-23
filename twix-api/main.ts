import { PostDoc, Post } from './post/post-doc';
import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { UserAuther } from './user/user-auth';
import { UserDoc, User } from './user/user-doc';

mongoose.connect('mongodb://localhost:27017/twix', {useNewUrlParser: true}, (err) => {

	let app = express();

	app.use(cors());
	app.use(express.urlencoded({extended: true}));
	app.use(express.json());

	app.post('/signup', async (req, res) => {
		let name = req.body.name;
		let username = req.body.username;
		let password = req.body.password;

		try
		{
			let user = await UserDoc.findByUsername(username);
			res.send({success: false, msg: `User '${username}' already exists`});
		}
		catch (err)
		{
			let user = new UserDoc({name, username, password});
			user.save(() => res.send({success: true}));
		}

	});

	app.get('/signin', async (req, res) => {
		let userAuther = new UserAuther();
	
		let username = req.query.username;
		let password = req.query.password;

		let [success, token] = await userAuther.signin(username, password);
		
		res.send({success, token});
	});

	async function auth(req: Request, res: Response, next)
	{
		let userAuther = new UserAuther();
		let params = req.method === 'GET' ? req.query : req.body;
		let token = params.token;
		let [valid, user] = await userAuther.authenticate(token);

		let rq: any = req;
		rq.auth = {valid, user};
		next();
	}
	
	app.get('/profile', auth, async (req, res) => {
		let name = '';
		let posts: Post[] = [];
		let auth = req.params.auth;
		console.log(auth);

		if (auth.valid)
		{
			let user = auth.user;
			name = user.name;
			posts = await PostDoc.findByUsername(user.username);
		}
	
		res.send({success: auth.valid, name, posts});
	});

	app.post('/post', auth, async (req, res) => {
		let auth = req.params.auth;

		if (auth.valid)
		{
			let user: User = auth.user;
			let post = new PostDoc();
			post.username = user.username;
			post.text = req.body.text;
			post.save(_ => res.send(true));
		}
		else
		{
			res.send(false);
		}
	});
	
	app.listen(3000, () => console.log('listening to port 3000'));

});
