import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { Channel } from './_models/Channel';
import { VideooList } from './_models/VideoList';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatButtonModule,MatExpansionModule,MatProgressBarModule,MatCardModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit  {
  title = 'YoutubeStat';
  isSignedInFlag:boolean=false
public chanels:Array<Channel>=[]
  private client_id = "25550250520-0u7kdg6ru508ntljvr2tk5smk1cqd0nm.apps.googleusercontent.com";
  private api_key = "AIzaSyCVjmtpRuWyqMUFy6S6QCrNVOluyM70Na8";
  private scope="https://www.googleapis.com/auth/youtube.readonly"
  private docs="https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"

constructor(private cd: ChangeDetectorRef,private ngZone: NgZone){}
  public isLoading:boolean=false
  ngOnInit(): void {
    this.initializeGoogleApi()
    this.ngZone.run(() => {
      this.cd.detectChanges();
  });
  }
  public change(){
    this.cd.detectChanges();
  }








  initializeGoogleApi(): void {
    this.isLoading=true
    loadGapiInsideDOM().then(() => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: this.api_key,
          clientId: this.client_id,
          discoveryDocs: [this.docs],
          scope: this.scope
        }).then(() => {
          console.log('Google API initialized');
          this.isSignedInFlag=this.isSignedIn();
          this.isLoading=false
          this.cd.detectChanges(); 
          // Тут можна викликати інші методи API, наприклад:
          // this.checkSignInStatus();
        }).catch((error: any) => {
          console.error('Error initializing Google API', error);
          this.isLoading=false
          this.cd.detectChanges(); 
        });
      });
    });
  }

public isSignedIn(){
  if (gapi.auth2!=undefined){
  const authInstance = gapi.auth2.getAuthInstance();

  return authInstance.isSignedIn.get()
  }else{
    return false
  }
}

  checkSignInStatus(): void {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
      console.log('User is signed in!!!');
      this.isSignedInFlag=this.isSignedIn()
      this.cd.detectChanges();
      // Можете продовжити з авторизованим користувачем
    } else {
      console.log('User is not signed in');
      authInstance.signIn({ prompt: 'consent' }).then(() => {
        console.log('User signed in');
        this.isSignedInFlag=this.isSignedIn()
        this.cd.detectChanges();
        // Можете продовжити з авторизованим користувачем
      }).catch((error: any) => {
        console.error('Error signing in', error);
      });
    }
  }









public async getList(){
  this.isLoading=true
  this.cd.detectChanges(); 
  let videoList=await this.getLikedVideos()
  let s = this.formStatistics(videoList)
  let chenels:Array<any>= await this.getChannels(s)
  chenels.forEach(element => element.persent = element.count * 100 / videoList.length);
  console.log(chenels)
  this.chanels = chenels as Array<Channel>;
  this.isLoading=false
  this.cd.detectChanges(); 
}
public goBack(){
window.location.reload()
}

  public async getLikedVideos () {
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



  public async getChannels (items:Array<any>) {
    for (let i = 0; i < items.length; i += 50) {
      let t = "";
      for (let j = i; j < i + 50; j++) {
        if (j != i) { t += "," }
        if (j < items.length) {
          t += items[j].channelId;
        }
      }
      let c:Array<any> = await this.chanalInfo(t);
      c.map(el => {
        items.forEach(item => {
          if (item.channelId == el.id) {
            item.description = el.snippet.description
            item.subscribers = el.statistics.subscriberCount
            item.picture = el.snippet.thumbnails.default.url
            item.url = `https://www.youtube.com/channel/${item.channelId}`
          }
        })
      })
    }
    return items;
  }






  private async chanalInfo (id:string) {
    let request_params = { "part": "snippet,contentDetails,statistics", "maxResults": 50, "id": id }
    let response:any= await gapi.client.youtube.channels.list(request_params);
    return response.result.items
  }





  /////////////////////////////////////////////////PRIVATE
  private formStatistics(items:Array<any>) {
    let statistics_list:Array<any> = []
    items.map(el => {
      if (statistics_list.some(ii => ii.channelId === el.snippet.channelId)) {
        statistics_list.map(it => {
          if (it.channelId === el.snippet.channelId) {
            it.count++
            it.videos.push({ id: el.id, title: el.snippet.title })
          }
        })
      }
      else {
        let statisticElement = this.push(el)
        statistics_list.push(statisticElement)
      }
    })
    statistics_list.sort((a, b) => a.count < b.count ? 1 : -1)
    return statistics_list
  }




  private push(item:any) {
    return { chanal: item.snippet.channelTitle, channelId: item.snippet.channelId, videos: [{ id: item.id, title: item.snippet.title }], count: 1 }
  }

}
