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
      }

      //    The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      var done = false;
      function onPlayerStateChange(event) {
        console.log(event.log);
      }
      
      
      function stopVideo() {
        player.stopVideo();
      }