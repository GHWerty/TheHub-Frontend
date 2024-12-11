export class User {
    id:number;
	nick:string;
	status:string;
	biography:string;
	followed:boolean;
	admin:boolean;

	constructor(id:number, nick:string, status:string, biography:string){
		this.id = id;
		this.nick = nick;
		this.status = status;
		this.biography = biography;
	}
}