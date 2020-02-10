import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';


// declare global {
//   interface window {
//     AmbientLightSensor: any
//   }
// }

@Component({
  selector: 'app-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['./playback.component.css']
})
export class PlaybackComponent implements OnInit, AfterViewInit {

  //Video player html5 element reference
  video

  //To store if the user started the video or not
  wasPlaying = false

  //Check for landscape mode
  isLandscape = false
  scrolledIntoView = false;

  //BatteryInfo
  batteryLevel = "0%"
  isBatteryCharging = false

  //Dark mode switch flag
  enableDarkMode = false


  constructor() { }

  ngOnInit() {
    //Add the visibility change event listener
    document.addEventListener("visibilitychange", this.pageVisibilityHandler.bind(this), false)

    //Add the device orientation change event listener
    window.addEventListener("deviceorientation", this.deviceOrientationHandler.bind(this), false)

    //Update battery info
    this.updateBatteryInfo()

    //Add Ambient Light sensor
    this.startAmbientLightSensor()
  }

  ngAfterViewInit() {
    //Get the video element
    this.video = document.getElementById('player')

    //Add play and pause video event
    this.video.addEventListener("pause", this.videoPauseHandler.bind(this), false)
    this.video.addEventListener("play", this.videoPlayHandler.bind(this), false)
  }


  startAmbientLightSensor() {
    const w: any = window
    const lightSensor = new w.AmbientLightSensor()
    
    lightSensor.onreading = () => {
      if (lightSensor.illuminance < 20) {
        this.enableDarkMode = true
      } else {
        this.enableDarkMode = false
      }
      console.log(lightSensor.illuminance)
    }
    lightSensor.onerror = (event) => {
      console.log(event.error.name, event.error.message)
    }
    lightSensor.start()
  }

  updateBatteryInfo() {
    const that = this
    //Typescript error workaround, assign navigator to a variable
    const nav: any = window.navigator
    nav.getBattery().then(function (batteryManager) {
      that.batteryLevel = batteryManager.level * 100 + "%"
      that.isBatteryCharging = batteryManager.charging
      batteryManager.addEventListener("chargingchange", function () {
        that.isBatteryCharging = batteryManager.charging
      })
    })
  }

  videoPauseHandler() {
    this.wasPlaying = false
  }

  videoPlayHandler() {
    this.wasPlaying = true
  }

  deviceOrientationHandler(event) {
    if (screen.orientation.type == "landscape-primary" || screen.orientation.type == "landscape-secondary") {
      this.isLandscape = true
    } else {
      this.isLandscape = false
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  }


  async pageVisibilityHandler() {
    if (document.hidden) {
      if (this.wasPlaying && !this.video.paused) {
        this.video.pause()
        navigator.vibrate(300)
      }
    } else {
      if (this.wasPlaying && this.video.paused) {
        this.video.play()
        navigator.vibrate(300)
      }
    }
  }

  gofull() {
    if (!document.fullscreenElement) {
      this.video.requestFullscreen()
    }
  }

  async share() {
    const shareData = {
      title: "Watch with me",
      text: "Watching big bunny video, yay!",
      url: "http://localhost:4200/"
    }
    //Typescript error workaround, assign navigator to a variable
    const nav: any = window.navigator;
    await nav.share(shareData)
    navigator.vibrate(300)
  }

}
