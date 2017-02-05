      // This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // This function creates an <iframe> (and YouTube player)
      // after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        $("#submitVideoUrl").prop("disabled", false);
        

      }

      // The API will call this function when the video player is ready.
      var playerReady = false;
      function onPlayerReady(event) {
        playerReady = true;
        event.target.playVideo();
          setInterval(function(){
              if (player.getPlayerState() == YT.PlayerState.PLAYING) {
                  ioSocket.emit("sync", {time: player.getCurrentTime()});
              }
          }, 3000);
      }

      //    The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      var done = false;
      var lastActionTime = 0;
      function onPlayerStateChange(event) {
          console.log(event.data);
          if (event.data == YT.PlayerState.PLAYING) {
              console.log(player.getCurrentTime());
              if (!resuming) {
                  ioSocket.emit("playing", {time: player.getCurrentTime()});
              } else {
                  resuming = false;
              }
          }

          if (event.data == YT.PlayerState.PAUSED) {
              if (!posing) {
                  ioSocket.emit("paused", {time: player.getCurrentTime()});
              } else {
                  posing =  false;
              }
          }

          if (event.data == YT.PlayerState.ENDED) {
              ioSocket.emit("ended", {time: player.getCurrentTime()});
          }

          if (event.data == YT.PlayerState.CUED) {
              ioSocket.emit("cued", {time: player.getCurrentTime()});
          }

      }

      
      function stopVideo() {
        player.stopVideo();
      }