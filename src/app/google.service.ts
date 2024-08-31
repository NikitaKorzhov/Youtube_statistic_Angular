import { Injectable } from '@angular/core';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { environment } from '../environments/environment';
import { VideooList } from './_models/VideoList';
@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  constructor() { }


  public async checkSignInStatus(): Promise<boolean> {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
     return true
    } else {
      authInstance.signIn({ prompt: 'consent' }).then(() => {
       return true
      }).catch((error: any) => {
       return false
      });
      return false

    }
  }
  async initializeGoogleApi(): Promise<boolean> {
    try {
      // Очікуємо завантаження GAPI
      await loadGapiInsideDOM();

      // Завантажуємо та ініціалізуємо Google API
      await this.initGoogleApi();

      console.log('Google API initialized');
      // this.isSignedInFlag = this.isSignedIn();
      return true
    } catch (error) {
      console.error('Error initializing Google API', error);
      return false
    }
  }


  public isSignedIn(){
    if (gapi.auth2!=undefined){
    const authInstance = gapi.auth2.getAuthInstance();

    return authInstance.isSignedIn.get()
    }else{
      return false
    }
  }

  public async chanalInfo (id:string) :Promise<any[]>{
    let request_params = { "part": "snippet,contentDetails,statistics", "maxResults": 50, "id": id }
    let response:any= await gapi.client.youtube.channels.list(request_params);
    return response.result.items
  }



  public async getLikedVideos ():Promise<any[]> {
    let iterator = 1;
    let leked_videos:Array<any> = []
    let npt = ""
    let params:any = { "part": "snippet,contentDetails,statistics", "maxResults": 50, "myRating": "like" }

    for ( let i = 0; i < iterator; i++) {
      console.log(iterator + " " + i)
      npt != "" ? params["pageToken"] = npt : "";
      let response=await gapi.client.youtube.videos.list(params);
      let result:VideooList = response["result"]
      npt = result.nextPageToken;
      console.log(result)
      iterator =1 + (result.pageInfo.totalResults / 50);

      result.items.map((y: any) => leked_videos.push(y))
    }
    console.log(leked_videos)
    return leked_videos;
  }




  // Асинхронний метод для ініціалізації Google API
  private async initGoogleApi(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: environment.apiKey,
            clientId: environment.clientId,
            discoveryDocs: [environment.docs],
            scope: environment.scope
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

}


