export class Forum {
    id:number;
	creatorId:number;
	title:string;
	status:string;
	description:string;
	rules:string;
	creationDate:Date;
	creator:string;
	followed:boolean;
	admin:boolean;
	banned:boolean;

	constructor(id:number, title:string, status:string, description:string, rules:string) {
		this.id = id;
		this.title = title;
		this.status = status;
		this.description = description;
		this.rules = rules;
	}
}