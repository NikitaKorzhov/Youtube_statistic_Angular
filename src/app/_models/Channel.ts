export class Channel{
    channelName:string=""
    channelId:string=""
    channelDescription:string=""
    channelAvatarUrl:string=""
    percent:number=0
    videos:Array<Video>=[]
}
export class Video{
    name:string=""
    url:string=""
}