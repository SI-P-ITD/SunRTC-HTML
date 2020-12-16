function guid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}


class RtcClient {
  constructor(options) {
	  var self = this
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;
	this.streamId_ = guid();
    this.isJoined_ = false;
    this.isPublished_ = false;
    this.isAudioMuted = false;
    this.isVideoMuted = false;
    this.localStream_ = null;
    this.remoteStreams_ = [];
    this.members_ = new Map();

    // create a client for RtcClient 为RtcClient创建一个客户端
    this.client_ = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_,
	  streamId: this.streamId_
    });
	var obj = {
      mode: 'rtc',
      sdkAppId: this.sdkAppId_,
      userId: vm.userName + '-PC',
      userSig: this.userSig_,
	  streamId: this.streamId_
    }
	console.log('obj',JSON.stringify(obj))
	// this.client_.setDefaultMuteRemoteStreams(false);
    this.handleEvents();
  }
	
  async join() {
		if(vm.locationVideo){
			$("#loading").hide();
			return
		}
    if (this.isJoined_) {
      console.warn('duplicate RtcClient.join() observed');
      return;
    }
    try {
      // join the room 加入房间
      await this.client_.join({
        roomId: this.roomId_
      });
      console.log('join room success');
      this.isJoined_ = true;
			
			//自定义视频采集
			let stream = null;
			stream = navigator.mediaDevices.getUserMedia({ audio: true, video: { width: 640, height: 480, frameRate: 15 } }).then(stream => {
			  const audioTrack = stream.getAudioTracks()[0];
			  const videoTrack = stream.getVideoTracks()[0];
			
			  const localStream = TRTC.createStream({ audioSource: audioTrack, videoSource: videoTrack });
			
			  // 请确保视频属性跟外部传进来的视频源一致，否则会影响视频通话体验
			  localStream.setVideoProfile('480p');
			
			  localStream.initialize().then(() => {
			    // local stream initialized success
			    console.log("本地流初始化成功");
				this.client_.setDefaultMuteRemoteStreams(false);
			  });
			});
			
      // create a local stream with audio/video from microphone/camera 创建一个本地流音频/视频从麦克风/摄像机
			
      this.localStream_ = TRTC.createStream({
        audio: true,
        video: true,
        userId: this.userId_,
        cameraId: getCameraId(),
        microphoneId: getMicrophoneId(),
        mirror: true
      });
      try {
        // initialize the local stream and the stream will be populated with audio/video  初始化本地流，该流将填充音频/视频
        await this.localStream_.initialize();
        console.log('初始化本地流成功');
				vm.locationVideo = true;
        this.localStream_.on('player-state-changed', event => {
          console.log(`local stream ${event.type} player is ${event.state}`);
        });

        // publish the local stream 发布本地流
        await getEnterRoomSuccess(sessionStorage.getItem("userId"),sessionStorage.getItem("roomId"),roomMembers++,timestamp);

        this.localStream_.play('main-video');
        $('#main-video-btns').show();
        $('#mask_main').appendTo($('#player_' + this.localStream_.getId()));
      } catch (e) {
        console.error('failed to initialize local stream - ' + e);
      }
    } catch (e) {
      console.error('join room failed! ' + e);
    }
    //更新成员状态
    let states = this.client_.getRemoteMutedState();
    console.log("成员状态更新");
    console.log(states);
		var statesArr = []
		for(var i=0;i<states.length;i++){
			var userId = states[i].userId;
			var userIndex = "distalisUserId"+i;
			sessionStorage.setItem(userIndex,userId);//远端成员集合
		}
		sessionStorage.setItem("statesLength",states.length);//远端成员集合
		
    //加入房间成功回调回调
	  var roomMembers = states.length+1;
		var timestamp = getNowFormatDate();
		
	  function getEnterRoomSuccess(username,roomNo,roomMembers,timestamp) {
			// var para={
			// 		"username":username,
			// 		"roomNo":roomNo,
			// 		"roomMembers":roomMembers,
			// 		"timestamp":timestamp
			// 	}
				var para = {
					userName:vm.uuid,
					surName:userName,
					roomNo:sessionStorage.getItem('roomNo'),
					streamId:sessionStorage.getItem('roomNo') +'_' + vm.uuid+'_main',
					caseSource:'1',
					videoManIdentity:'2',
					orderId:sessionStorage.getItem('orderId'),
					sdkType:'carclaim',
				}
			var onSuccess = function(data){
				console.log("加入房间成功回调接口成功"+data);
				if(data.resCode == "0000"){
					
					$("#loading").hide();
//						data.resultContent.theFirstOneEnter //Y为第一个进入房间 N不是第一个
					sessionStorage.setItem("businessNo",data.resultContent.businessNo);//任务唯一流水号
					self.publish();
				}
			}
			
			myajaxTRTC("enterRoomSuccessPro",para,onSuccess)
			// var ajax = new MYAJAX("enterRoomSuccessDemo", "h5", para, onSuccess);
		}
    for (let state of states) {
      if (state.audioMuted) {
        $('#' + state.userId)
          .find('.member-audio-btn')
          .attr('src', './img/mic-off.png');
      }
      if (state.videoMuted) {
        $('#' + state.userId)
          .find('.member-video-btn')
          .attr('src', './img/camera-off.png');
        $('#mask_' + this.members_.get(state.userId).getId()).show();
      }
    }
  }

  async leave() {
  	console.log(this.remoteStreams_.length);
//	if(this.remoteStreams_.length > 0){
  		var timestamp = getNowFormatDate();
	    var roomMembers = this.remoteStreams_.length+1;
			getLeaveRoom(sessionStorage.getItem("userId"),sessionStorage.getItem("businessNo"),sessionStorage.getItem("roomId"),roomMembers,timestamp);
//	}else if(this.remoteStreams_.length === 0){
//		var timestamp = getNowFormatDate();
	    //getDismissRoom(sessionStorage.getItem("businessNo"),sessionStorage.getItem("roomId"),sessionStorage.getItem("userId"),timestamp);
//	}
  	//离开房间接口调用
    function getLeaveRoom(username,businessNo,roomNo,roomMembers,timestamp) {
				var para = {
					orderId:sessionStorage.getItem("orderId"),
					userName:vm.uuid,
					businessNo:businessNo,
					roomNo:sessionStorage.getItem("roomNo"),
					sdkType:'carclaim',
				}
			var onSuccess = function(data){
//				console.log(data);{resCode: "0000", resMsg: "成功", resultContent: ""}
				if(data.resCode == "0000"){
					console.log("挂断视频");
					vm.isClick = false;
					setTimeout(function(){
						window.location.reload();
					},2000)
					
					// vm.iFlogin = false;
					// vm.userInfo.userName = sessionStorage.getItem('userId')
					// window.location.href = "roomList.html?name="+username;
				}else{
					self.$Message.error("系统异常");
				}
			}
				myajaxTRTC("leaveRoomPro",para,onSuccess)
			// var ajax = new MYAJAX("leaveRoom", "h5", para, onSuccess);
		}
    //解散房间接口调用
    function getDismissRoom(businessNo,roomNo,username,timestamp) {
			var para={
					"username":username,
					"businessNo":businessNo,
					"roomNo":roomNo,
					"timestamp":timestamp
//					"password":""
				}
			var onSuccess = function(data){
//				console.log(data);{resCode: "0000", resMsg: "成功", resultContent: ""}
				if(data.resCode == "0000"){
					window.location.href = "roomList.html";
				}
			}
			var ajax = new MYAJAX("dismissRoom", "h5", para, onSuccess);
		}
    
    if (!this.isJoined_) {
      console.warn('leave() - please join() firstly');
      return;
    }
    // ensure the local stream is unpublished before leaving.  在离开之前，确保本地流是未发布的。
    await this.unpublish();

    // leave the room 离开房间
    await this.client_.leave();

    this.localStream_.stop();
    this.localStream_.close();
    this.localStream_ = null;
    this.isJoined_ = false;
    resetView();
    
  }
	//发布
  async publish() {
    if (!this.isJoined_) {
      console.warn('publish() - please join() firstly');
      return;
    }
    if (this.isPublished_) {
      console.warn('duplicate RtcClient.publish() observed');
      return;
    }
    try {
      await this.client_.publish(this.localStream_).then(function(){
		  console.log('发布本地流成功')
	  });
	   
    } catch (e) {
      console.error('failed to publish local stream ' + e);
      this.isPublished_ = false;
    }

    this.isPublished_ = true;
  }
//取消发布本地流
  async unpublish() {
    if (!this.isJoined_) {
      console.warn('unpublish() - please join() firstly');
      return;
    }
    if (!this.isPublished_) {
      console.warn('RtcClient.unpublish() called but not published yet');
      return;
    }

    await this.client_.unpublish(this.localStream_);
    this.isPublished_ = false;
  }

  muteLocalAudio() {
    this.localStream_.muteAudio();
  }

  unmuteLocalAudio() {
    this.localStream_.unmuteAudio();
  }

  muteLocalVideo() {
    this.localStream_.muteVideo();
  }

  unmuteLocalVideo() {
    this.localStream_.unmuteVideo();
  }
	//获取远端流视频帧
	getRemoteVideoFrame() {
		const frame = this.remoteStream.getVideoFrame();
		if(frame) {
			const img = document.createElement('img');
			img.src = frame;
			return frame;
		}
	}
  resumeStreams() {
    this.localStream_.resume();
    for (let stream of this.remoteStreams_) {
      stream.resume();
    }
  }

  handleEvents() {
    this.client_.on('error', err => {
      console.error(err);
      alert(err);
      location.reload();
    });
    this.client_.on('client-banned', err => {
      console.error('client has been banned for ' + err);
      if (!isHidden()) {
        alert('您已被踢出房间');
        // location.reload();
				window.location.reload();
      } else {
        document.addEventListener(
          'visibilitychange',
          () => {
            if (!isHidden()) {
              alert('您已被踢出房间');
              // location.reload();
							window.location.reload();
            }
          },
          false
        );
      }
    });
    // fired when a remote peer is joining the room  当远程对等程序正在加入房间时触发
    this.client_.on('peer-join', evt => {
      const userId = evt.userId;
      console.log('peer-join ' + userId);
      if (userId !== shareUserId) {
        addMemberView(userId);
      }
    });
    // fired when a remote peer is leaving the room  当远程对等程序离开房间时触发
    this.client_.on('peer-leave', evt => {
      const userId = evt.userId;
      removeView(userId);
      console.log('peer-leave ' + userId);
    });
    // fired when a remote stream is added 添加远程流时触发
    this.client_.on('stream-added', evt => {
			var ifhasID = false;
			this.remoteStream = evt.stream;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      const userId = remoteStream.getUserId();
      this.members_.set(userId, remoteStream);
			if(vm.memberList.length !=0){
				for(var i=0;i<vm.memberList.length;i++){
					if(userId  ==vm.memberList[i].reqUserName){
						ifhasID = true;
					}
				}
			}
			if(!ifhasID){
				var memberInfo = {
					reqUserName: userId,
					deviceType:sessionStorage.getItem("deviceType"),
					video:'开',	//麦克风
					audio:remoteStream.hasAudio_?'开':'关'
				}
				vm.memberList.push(memberInfo)
			}
			console.log(vm.memberList);
      console.log(`remote stream added: [${userId}] ID: ${id} type: ${remoteStream.getType()}`);
      if (remoteStream.getUserId() === shareUserId) {
        // don't need screen shared by us
        this.client_.unsubscribe(remoteStream);
      } else { 
        console.log('subscribe to this remote stream');
        this.client_.subscribe(remoteStream);
		console.log('订阅远端流')
      }
    });
    // fired when a remote stream has been subscribed  当远程流已被订阅时触发
    this.client_.on('stream-subscribed', evt => {
      const uid = evt.userId;
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      this.remoteStreams_.push(remoteStream);
	  console.log("this.remoteStreams_",this.remoteStreams_)
      remoteStream.on('player-state-changed', event => {
        console.log(`${event.type} player is ${event.state}`);
        if (event.type == 'video' && event.state == 'STOPPED') {
          $('#mask_' + remoteStream.getId()).show();
          $('#' + remoteStream.getUserId())
            .find('.member-video-btn')
            .attr('src', 'img/camera-off.png');
        }
        if (event.type == 'video' && event.state == 'PLAYING') {
          $('#mask_' + remoteStream.getId()).hide();
          $('#' + remoteStream.getUserId())
            .find('.member-video-btn')
            .attr('src', 'img/camera-on.png');
        }
      });
      addVideoView(id);
      // objectFit 为播放的填充模式，详细参考：https://trtc-1252463788.file.myqcloud.com/web/docs/Stream.html#play
      remoteStream.play(id, { objectFit: 'contain' });
      //添加“摄像头未打开”遮罩
      let mask = $('#mask_main').clone();
      mask.attr('id', 'mask_' + id);
      mask.appendTo($('#player_' + id));
      mask.hide();
      if (!remoteStream.hasVideo()) {
        mask.show();
        $('#' + remoteStream.getUserId())
          .find('.member-video-btn')
          .attr('src', 'img/camera-off.png');
      }
      console.log('stream-subscribed ID: ', id);
    });
    //当远程流被删除时触发，例如，远程用户Client.unpublish()
    // fired when the remote stream is removed, e.g. the remote user called Client.unpublish()
    this.client_.on('stream-removed', evt => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop();
			// for(var i=0;i<vm.memberList.length;i++){
			// 	if(vm.memberList[i].reqUserName == id){
			// 		vm.memberList.splice(i,1)
			// 	}
			// }
      this.remoteStreams_ = this.remoteStreams_.filter(stream => {
        return stream.getId() !== id;
      });
      removeView(id);
      console.log(`stream-removed ID: ${id}  type: ${remoteStream.getType()}`);
    });

    this.client_.on('stream-updated', evt => {
      const remoteStream = evt.stream;
      let uid = this.getUidByStreamId(remoteStream.getId());
      if (!remoteStream.hasVideo()) {
        $('#' + uid)
          .find('.member-video-btn')
          .attr('src', 'img/camera-off.png');
      }
      console.log(
        'type: ' +
          remoteStream.getType() +
          ' stream-updated hasAudio: ' +
          remoteStream.hasAudio() +
          ' hasVideo: ' +
          remoteStream.hasVideo() +
          ' uid: ' +
          uid
      );
    });

    this.client_.on('mute-audio', evt => {
      console.log(evt.userId + ' mute audio');
			for(var i=0;i<vm.memberList.length;i++){
				if(vm.memberList[i].reqUserName == evt.userId){
					vm.memberList[i].video = '关'
				}
			}
      // $('#' + evt.userId)
      //   .find('.member-audio-btn')
      //   .attr('src', 'img/mic-off.png');
    });
    this.client_.on('unmute-audio', evt => {
      console.log(evt.userId + ' unmute audio');
			for(var i=0;i<vm.memberList.length;i++){
				if(vm.memberList[i].reqUserName == evt.userId){
					vm.memberList[i].video = '开'
				}
			}
      // $('#' + evt.userId)
      //   .find('.member-audio-btn')
      //   .attr('src', 'img/mic-on.png');
    });
    this.client_.on('mute-video', evt => {
      console.log(evt.userId + ' mute video');
			for(var i=0;i<vm.memberList.length;i++){
				if(vm.memberList[i].reqUserName == evt.userId){
					vm.memberList[i].audio = '关'
				}
			}
      $('#' + evt.userId)
        .find('.member-video-btn')
        .attr('src', 'img/camera-off.png');
      let streamId = this.members_.get(evt.userId).getId();
      if (streamId) {
        $('#mask_' + streamId).show();
      }
    });
    this.client_.on('unmute-video', evt => {
      console.log(evt.userId + ' unmute video');
			for(var i=0;i<vm.memberList.length;i++){
				if(vm.memberList[i].reqUserName == evt.userId){
					vm.memberList[i].audio = '开'
				}
			}
      $('#' + evt.userId)
        .find('.member-video-btn')
        .attr('src', 'img/camera-on.png');
      const stream = this.members_.get(evt.userId);
      if (stream) {
        let streamId = stream.getId();
        if (streamId) {
          $('#mask_' + streamId).hide();
        }
      }
    });
  }
	//显示流状态
  showStreamState(stream) {
    console.log('has audio: ' + stream.hasAudio() + ' has video: ' + stream.hasVideo());
  }
	//通过流Id获取Uid
  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members_) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
  }
}
