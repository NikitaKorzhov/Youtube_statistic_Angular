export class VideooList{
    etag:string=""
    kind:string=""
    prevPageToken:string=""
    nextPageToken:string=""
    pageInfo:{resultsPerPage:number,totalResults:number}={totalResults:0,resultsPerPage:0}
    items:Array<any>=[]
}