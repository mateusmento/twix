import { UserDoc, User } from "./user-doc";
import jwt from 'jsonwebtoken';

interface UserTokenData
{
	username: string
}

export class UserAuther
{
	private jwtSecret = 'secret';

	async signin(username: string, password: string): Promise<[boolean, string]>
	{
		let token = '';
		let success = false;

		try
		{
			let user: User = await UserDoc.findByUsername(username);

			let isEqual: boolean = await user.comparePassword(password);
			
			if (isEqual)
			{
				token = await this.generateToken(user);
				success = true;
			}
			
		}
		catch(err)
		{
			console.log(err);
		}

		return [success, token];
	}

	private generateToken(user: User): Promise<string>
	{
		return new Promise<string>((res, rej) => {

			let userTokenData: UserTokenData = {username: user.username};

			jwt.sign(userTokenData, this.jwtSecret, (err, token) => {
				if (err) rej(err);
				else res(token);
			});

		});
	}

	private getTokenData(token: string): Promise<UserTokenData>
	{
		return new Promise<UserTokenData>((res, rej) => {
			jwt.verify(token, this.jwtSecret, (err, data) => {
				if (err) rej(err);
				else res(data as UserTokenData);
			});
		});
	}

	async authenticate(token: string): Promise<[boolean, User | null]>
	{
		let tokeData: UserTokenData = await this.getTokenData(token);
		let username: string = tokeData.username;
		let success = true;

		let user: User | null = null;

		try
		{
			user = await UserDoc.findByUsername(username);
		}
		catch(err)
		{
			success = false;
		}

		return [success, user];
	}

}
