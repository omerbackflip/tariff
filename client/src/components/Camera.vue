<!-- in order to access the camera in the user phone - need to configure this:
https://stackoverflow.com/questions/34878749/in-androids-google-chrome-how-to-set-unsafely-treat-insecure-origin-as-secure#:~:text=This%20can%20be%20done%20from,to%20be%20treated%20as%20secure 

This can be done from chrome://flags/ or about://flags.
Go to about://flags, search for unsafely-treat-insecure-origin-as-secure flag, and enable it. 
You will have to provide the origin which you want to be treated as secure.
Multiple origins can be entered as comma-separated values.
Relaunch your browser after making this change.

Note that the protocol part is also important, and specifying the IP address, or the domain name isn't enough. 
eg. http:// in http://185.28.152.24:8085  . If you are not using port 80, then you may have to specify that too. -->

<template>
    <div class="camera-box">
        <div style="display: flex; justify-content: center;">
            <img style="height: 25px;" v-if="isCameraOpen"
                 src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png"
                 class="button-img camera-shoot" @click="capture"/>
            <div class="camera-button">
                <button type="button" class="button is-rounded cam-button"
                        style="margin-left: 40%; background-color: white; border: 0px; width: 100%;"
                        @click="toggleCamera"
                >
                    <span v-if="!isCameraOpen">
                        <!--Start Uploading Images
                        <img style="height: 25px;" class="button-img"
                                        src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png">-->
                    </span>
                    <span v-else>
                        <img style="height: 25px;" @click="stopCameraStream()" class="button-img"
                                      src="https://img.icons8.com/material-outlined/50/000000/cancel.png">
                    </span>
                </button>
            </div>
        </div>
        <div>
            <div v-if="isCameraOpen" class="camera-canvas">
                <video ref="camera" :width="canvasWidth" :height="canvasHeight" autoplay @click="capture"></video>
                <canvas v-show="false" id="photoTaken" ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
            </div>
        </div>
    </div>
</template>
 
<script>
    export default {
        name: "Camera",
        data() {
            return {
                isCameraOpen: false,
                canvasHeight:300,
                canvasWidth:300,
                items: [],
            }
        },
        methods: {
            toggleCamera() {
                if (this.isCameraOpen) {
                    this.isCameraOpen = false;
                    this.stopCameraStream();
                } else {
                    this.isCameraOpen = true;
                    this.startCameraStream();
                }
            },
            startCameraStream() {
                let constraints = ''
                if(this.isMobile()){
                    constraints = (window.constraints = {
                        audio: false,
                        video: {
                            facingMode: {
                              exact: "environment" //user - front,   environment -> back
                            }
                        }
                    });
                }else{
                    constraints = (window.constraints = {
                        audio: false,
                        video: true,
                    });
                }

                navigator.mediaDevices
                    .getUserMedia(constraints)
                    .then(stream => {
                        this.$refs.camera.srcObject = stream;
                        this.openFullscreen(this.$refs.camera);
                    }).catch(error => {
                    alert("Browser doesn't support or there is some errors." + error);
                });
            },
 
            stopCameraStream() {
                let tracks = this.$refs.camera.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                });
            },
 
            capture() {
                const FLASH_TIMEOUT = 50;
                let self = this;
                setTimeout(() => {
                    const context = self.$refs.canvas.getContext('2d');
                    context.drawImage(self.$refs.camera, 0, 0, self.canvasWidth, self.canvasHeight);
                    const dataUrl = self.$refs.canvas.toDataURL("image/jpeg")
                        .replace("image/jpeg", "image/octet-stream");
                    self.addToPhotoGallery(dataUrl);
                    self.uploadPhoto(dataUrl);
                    self.isCameraOpen = false;
                    self.stopCameraStream();

                    let mediaInfo = {
                        id: (this.items.length - 1),
                        fileContent: dataUrl,
                        source: "camera",
                    };
                    this.$emit('new-media-added', mediaInfo);

                }, FLASH_TIMEOUT);
            },
 
            addToPhotoGallery(dataURI) {
                this.items.push(
                    {
                        src: dataURI,
                        thumbnail: dataURI,
                        w: this.canvasWidth,
                        h: this.canvasHeight,
                        alt: 'some numbers on a grey background' // optional alt attribute for thumbnail image
                    }
                )

                // console.log(this.items);
            },
            uploadPhoto(dataURL){
                let uniquePictureName = this.generateCapturePhotoName();
                let capturedPhotoFile = this.dataURLtoFile(dataURL, uniquePictureName+'.jpg')
                let formData = new FormData()
                formData.append('file', capturedPhotoFile)
                // Upload image api
                // axios.post('http://your-url-upload', formData).then(response => {
                //   console.log(response)
                // })
            },
 
            generateCapturePhotoName(){
                return  Math.random().toString(36).substring(2, 15)
            },

            openFullscreen(videoElement) {
              var elem = videoElement
              
              if (elem.requestFullscreen) {
                elem.requestFullscreen();
              } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
              } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
              } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
              }
            },
 
            dataURLtoFile(dataURL, filename) {
                let arr = dataURL.split(','),
                    mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]),
                    n = bstr.length,
                    u8arr = new Uint8Array(n);
 
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new File([u8arr], filename, {type: mime});
            },
            isMobile() {
               if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                 return true
               } else {
                 return false
               }
            }
        }
    }
</script>
 
<style scoped>
    .camera-box {
        border: 1px dashed #d6d6d6;
        border-radius: 4px;
        padding: 2px;
        /* width: 80%;
        min-height: 300px; */
    }
    video::-webkit-media-controls {
      display: none;
    }
</style>