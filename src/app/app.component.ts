import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { loadGapiInsideDOM, gapi } from 'gapi-script';
import { Channel } from './_models/Channel';
import { VideooList } from './_models/VideoList';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import { GoogleService } from './google.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule,MatButtonModule,MatExpansionModule,MatProgressBarModule,MatCardModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers:[GoogleService]
})
export class AppComponent implements OnInit  {
  title = 'YoutubeStat';
  isSignedInFlag:boolean=false
public chanels:Array<Channel>=[]
constructor(private cd: ChangeDetectorRef,private ngZone: NgZone,private _googleService:GoogleService){}
  public isLoading:boolean=false
  async ngOnInit() {
    this.isLoading=true
    let init=await this._googleService.initializeGoogleApi()
    if(init){
      console.log('Google API initialized');
      this.isSignedInFlag=this._googleService.isSignedIn()
    }else{
      console.error('Error initializing Google API');
    }
    this.isLoading=false
    this.cd.detectChanges();
    this.ngZone.run(() => {
      this.cd.detectChanges();
  });
  }
  public change(){
    this.cd.detectChanges();
  }

  public async checkSignInStatus(){
    let signedIn= await this._googleService.checkSignInStatus()
    if(signedIn){
      console.log('User is signed in!!!');
      this.isSignedInFlag=this._googleService.isSignedIn()
      this.cd.detectChanges();
    }else{
      console.log('User is not signed in!!!');
      this.isSignedInFlag=false
    }
  }


public async getList(){
  this.isLoading=true
  this.cd.detectChanges();
  let videoList=await this._googleService.getLikedVideos()
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

  public async getChannels (items:Array<any>) {
    for (let i = 0; i < items.length; i += 50) {
      let t = "";
      for (let j = i; j < i + 50; j++) {
        if (j != i) { t += "," }
        if (j < items.length) {
          t += items[j].channelId;
        }
      }
      let c:Array<any> = await this._googleService.chanalInfo(t);
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
