export class Channel{
    channelId:string=""
    chanal:string=""
    count:number=0
    description:string=""
    persent:number=0
    picture:string=""
    subscribers:string=""
    url:string=""
    videos:Array<Video>=[]
    opened:boolean=false
}
export class Video{
    id:string=""
    title:string=""
}